type FilterName = "type" | "domain" | "tag";

interface PagefindItemData {
  url: string;
  meta?: Record<string, string>;
  excerpt?: string;
  plain_excerpt?: string;
}

interface PagefindResult {
  data: () => Promise<PagefindItemData>;
}

interface PagefindResponse {
  results: PagefindResult[];
}

interface PagefindApi {
  search: (
    query: string | null,
    options?: { filters?: Partial<Record<FilterName, string>> },
  ) => Promise<PagefindResponse>;
  filters: () => Promise<Record<string, Record<string, number>>>;
}

const PAGEFIND_PATH = "/pagefind/pagefind.js";
const TYPE_LABELS: Record<string, string> = {
  article: "文章",
  articles: "文章",
  research: "研究",
  project: "项目",
  projects: "项目",
};

let pagefindPromise: Promise<PagefindApi> | undefined;
const controllers = new Map<HTMLElement, PagefindSearchController>();

function isPagefindApi(value: unknown): value is PagefindApi {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { search?: unknown; filters?: unknown };
  return typeof candidate.search === "function" && typeof candidate.filters === "function";
}

async function loadPagefind(): Promise<PagefindApi> {
  pagefindPromise ??= import(/* @vite-ignore */ PAGEFIND_PATH)
    .then((module: unknown) => {
      if (!isPagefindApi(module)) throw new Error("Pagefind API 不完整");
      return module;
    })
    .catch((error: unknown) => {
      pagefindPromise = undefined;
      throw error;
    });
  return pagefindPromise;
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  return element;
}

function appendSafeHighlight(container: HTMLElement, source: string): void {
  let highlighted = false;
  for (const token of source.split(/(<mark>|<\/mark>)/gi)) {
    if (/^<mark>$/i.test(token)) {
      highlighted = true;
      continue;
    }
    if (/^<\/mark>$/i.test(token)) {
      highlighted = false;
      continue;
    }
    if (!token) continue;
    if (highlighted) {
      const mark = createElement(
        "mark",
        "rounded-sm bg-blue-100 px-0.5 text-inherit dark:bg-blue-900/60",
      );
      mark.textContent = token;
      container.append(mark);
    } else {
      container.append(document.createTextNode(token));
    }
  }
}

function safeResultUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl, window.location.origin);
    if (url.origin !== window.location.origin || !["http:", "https:"].includes(url.protocol)) {
      return "/";
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

function resultTitle(item: PagefindItemData): string {
  const title = item.meta?.title?.trim();
  if (title) return title;
  const path = safeResultUrl(item.url).split(/[?#]/, 1)[0];
  try {
    return decodeURIComponent(path).replace(/^\/+|\/+$/g, "") || "未命名页面";
  } catch {
    return path.replace(/^\/+|\/+$/g, "") || "未命名页面";
  }
}

function parseLabelMap(source: string | undefined): Record<string, string> {
  if (!source) return {};
  try {
    const parsed: unknown = JSON.parse(source);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    );
  } catch {
    return {};
  }
}

class PagefindSearchController {
  private readonly root: HTMLElement;
  private readonly form: HTMLFormElement;
  private readonly input: HTMLInputElement;
  private readonly output: HTMLElement;
  private readonly status: HTMLElement;
  private readonly clearButton: HTMLButtonElement;
  private readonly filters: HTMLSelectElement[];
  private readonly domainLabels: Record<string, string>;
  private readonly eventController = new AbortController();
  private queryController: AbortController | undefined;
  private api: PagefindApi | undefined;
  private preparing: Promise<PagefindApi | undefined> | undefined;
  private resultLinks: HTMLAnchorElement[] = [];
  private activeIndex = -1;
  private requestNumber = 0;
  private debounceTimer: number | undefined;
  private destroyed = false;

  constructor(root: HTMLElement) {
    this.root = root;
    this.form = this.requireElement<HTMLFormElement>("[data-pagefind-form]");
    this.input = this.requireElement<HTMLInputElement>("[data-pagefind-input]");
    this.output = this.requireElement<HTMLElement>("[data-pagefind-results]");
    this.status = this.requireElement<HTMLElement>("[data-pagefind-status]");
    this.clearButton = this.requireElement<HTMLButtonElement>("[data-pagefind-clear]");
    this.filters = Array.from(
      this.root.querySelectorAll<HTMLSelectElement>("select[data-pagefind-filter]"),
    );
    this.domainLabels = parseLabelMap(this.root.dataset.pagefindDomainLabels);
    this.bindEvents();
    this.updateClearButton();
    if (root.dataset.pagefindAutoLoad === "true") void this.prepare();
  }

  private requireElement<T extends Element>(selector: string): T {
    const element = this.root.querySelector<T>(selector);
    if (!element) throw new Error(`搜索组件缺少 ${selector}`);
    return element;
  }

  private bindEvents(): void {
    const signal = this.eventController.signal;
    this.form.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();
        this.cancelDebounce();
        void this.search();
      },
      { signal },
    );
    this.input.addEventListener(
      "input",
      () => {
        this.updateClearButton();
        this.scheduleSearch();
      },
      { signal },
    );
    this.input.addEventListener("keydown", (event) => this.onInputKeydown(event), { signal });
    this.filters.forEach((filter) => {
      filter.addEventListener(
        "change",
        () => {
          this.updateClearButton();
          this.cancelDebounce();
          void this.search();
        },
        { signal },
      );
    });
    this.clearButton.addEventListener(
      "click",
      () => {
        this.input.value = "";
        this.filters.forEach((filter) => (filter.value = ""));
        this.updateClearButton();
        this.cancelCurrentQuery();
        this.renderIdle();
        this.input.focus();
      },
      { signal },
    );
    this.root.addEventListener(
      "focusin",
      () => {
        void this.prepare();
      },
      { once: true, signal },
    );
    this.root.addEventListener(
      "click",
      (event) => {
        const target = event.target;
        if (!(target instanceof Element) || !target.closest("[data-pagefind-retry]")) return;
        if (this.hasCriteria()) {
          void this.search(true);
        } else {
          this.api = undefined;
          void this.prepare();
        }
      },
      { signal },
    );
  }

  private scheduleSearch(): void {
    this.cancelDebounce();
    if (!this.hasCriteria()) {
      this.cancelCurrentQuery();
      this.renderIdle();
      return;
    }
    this.cancelCurrentQuery();
    this.setStatus("准备搜索…");
    this.renderMessage("loading", "正在等待输入完成…");
    this.debounceTimer = window.setTimeout(() => void this.search(), 180);
  }

  private cancelDebounce(): void {
    if (this.debounceTimer === undefined) return;
    window.clearTimeout(this.debounceTimer);
    this.debounceTimer = undefined;
  }

  private cancelCurrentQuery(): void {
    this.queryController?.abort();
    this.queryController = undefined;
    this.requestNumber += 1;
    this.setBusy(false);
  }

  private async prepare(): Promise<PagefindApi | undefined> {
    if (this.api) return this.api;
    if (this.preparing) return this.preparing;

    this.setStatus("正在加载本地搜索索引…");
    if (!this.hasCriteria()) this.renderMessage("loading", "正在加载 Pagefind 搜索索引…");
    this.setBusy(true);

    const preparing = (async () => {
      try {
        const api = await loadPagefind();
        if (this.destroyed) return undefined;
        this.api = api;
        try {
          this.populateFilters(await api.filters());
        } catch {
          this.disableUnavailableFilters();
        }
        if (!this.hasCriteria()) this.renderIdle();
        return api;
      } catch {
        if (!this.destroyed) this.renderLoadError();
        return undefined;
      } finally {
        if (!this.destroyed) this.setBusy(false);
      }
    })();

    this.preparing = preparing;
    const api = await preparing;
    if (this.preparing === preparing) this.preparing = undefined;
    return api;
  }

  private populateFilters(allFilters: Record<string, Record<string, number>>): void {
    const collator = new Intl.Collator("zh-CN", { numeric: true, sensitivity: "base" });
    this.filters.forEach((select) => {
      const name = select.dataset.pagefindFilter as FilterName | undefined;
      if (!name) return;
      const currentValue = select.value;
      const allLabel = select.dataset.pagefindAllLabel ?? "全部";
      const defaultOption = new Option(allLabel, "");
      const values = Object.entries(allFilters[name] ?? {})
        .filter(([, count]) => Number.isFinite(count) && count > 0)
        .sort(([left], [right]) => collator.compare(left, right));
      select.replaceChildren(defaultOption);
      values.forEach(([value, count]) => {
        const label =
          name === "type"
            ? (TYPE_LABELS[value] ?? value)
            : name === "domain"
              ? (this.domainLabels[value] ?? value)
              : value;
        select.add(new Option(`${label} (${count})`, value));
      });
      select.disabled = values.length === 0;
      select.title = values.length === 0 ? `当前索引没有可用的${name}筛选项` : "";
      if (values.some(([value]) => value === currentValue)) select.value = currentValue;
    });
  }

  private disableUnavailableFilters(): void {
    this.filters.forEach((filter) => {
      filter.disabled = true;
      filter.title = "搜索可用，但筛选项暂时无法加载";
    });
  }

  private selectedFilters(): Partial<Record<FilterName, string>> {
    const selected: Partial<Record<FilterName, string>> = {};
    this.filters.forEach((filter) => {
      const name = filter.dataset.pagefindFilter as FilterName | undefined;
      if (name && filter.value) selected[name] = filter.value;
    });
    return selected;
  }

  private hasCriteria(): boolean {
    return (
      this.input.value.trim().length > 0 || this.filters.some((filter) => Boolean(filter.value))
    );
  }

  private async search(forceReload = false): Promise<void> {
    this.cancelDebounce();
    if (!this.hasCriteria()) {
      this.cancelCurrentQuery();
      this.renderIdle();
      return;
    }

    if (forceReload) this.api = undefined;
    this.queryController?.abort();
    const queryController = new AbortController();
    this.queryController = queryController;
    const requestNumber = ++this.requestNumber;
    const isStale = () =>
      this.destroyed || queryController.signal.aborted || requestNumber !== this.requestNumber;

    this.setBusy(true);
    this.setStatus("正在搜索…");
    this.renderMessage("loading", "正在检索本地索引…");

    const api = await this.prepare();
    if (!api || isStale()) {
      if (!isStale()) this.queryController = undefined;
      return;
    }

    try {
      const query = this.input.value.trim();
      const selectedFilters = this.selectedFilters();
      const response = await api.search(query || null, {
        filters: Object.keys(selectedFilters).length > 0 ? selectedFilters : undefined,
      });
      if (isStale()) return;

      const limit = Math.max(1, Number.parseInt(this.root.dataset.pagefindLimit ?? "24", 10) || 24);
      const settledItems = await Promise.allSettled(
        response.results.slice(0, limit).map((result) => result.data()),
      );
      if (isStale()) return;
      const items = settledItems.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : [],
      );
      if (items.length === 0) {
        this.renderEmpty();
      } else {
        this.renderResults(items, response.results.length);
      }
    } catch {
      if (!isStale()) this.renderSearchError();
    } finally {
      if (!isStale()) {
        this.queryController = undefined;
        this.setBusy(false);
      }
    }
  }

  private renderResults(items: PagefindItemData[], total: number): void {
    const fragment = document.createDocumentFragment();
    const typeLabel = (value: string | undefined) => (value ? (TYPE_LABELS[value] ?? value) : "");
    items.forEach((item, index) => {
      const link = createElement(
        "a",
        "pagefind-result block border border-slate-200 bg-white p-4 text-slate-900 transition hover:border-blue-400 hover:bg-blue-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-blue-500 dark:hover:bg-blue-950/30",
      );
      link.href = safeResultUrl(item.url);
      link.id = `${this.output.id}-option-${index}`;
      link.setAttribute("role", "option");
      link.setAttribute("aria-selected", "false");
      link.dataset.active = "false";

      const meta = createElement("div", "mb-2 flex flex-wrap items-center gap-2");
      const type = typeLabel(item.meta?.type);
      const domainSlug = item.meta?.domain?.trim();
      const domain = domainSlug ? (this.domainLabels[domainSlug] ?? domainSlug) : undefined;
      [type, domain].forEach((label) => {
        if (!label) return;
        const badge = createElement(
          "span",
          "border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300",
        );
        badge.textContent = label;
        meta.append(badge);
      });
      if (meta.childElementCount > 0) link.append(meta);

      const title = createElement("span", "block text-base font-semibold leading-6");
      title.textContent = resultTitle(item);
      link.append(title);

      const excerptSource = item.excerpt?.trim() || item.meta?.description?.trim() || "";
      if (excerptSource) {
        const excerpt = createElement(
          "p",
          "mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300",
        );
        appendSafeHighlight(excerpt, excerptSource);
        link.append(excerpt);
      }

      link.addEventListener("pointerenter", () => this.setActiveResult(index, false), {
        signal: this.eventController.signal,
      });
      fragment.append(link);
    });

    this.output.replaceChildren(fragment);
    this.resultLinks = Array.from(
      this.output.querySelectorAll<HTMLAnchorElement>("a[role='option']"),
    );
    this.activeIndex = -1;
    this.input.removeAttribute("aria-activedescendant");
    this.input.setAttribute("aria-expanded", "true");
    this.setStatus(
      total > items.length
        ? `找到 ${total} 条结果，当前显示前 ${items.length} 条。`
        : `找到 ${total} 条结果。`,
    );
  }

  private renderIdle(): void {
    this.renderMessage("idle", "输入关键词，或选择类型、领域、标签筛选。");
    this.setStatus("可以开始搜索。使用上下方向键选择结果，按 Enter 打开。");
  }

  private renderEmpty(): void {
    this.renderMessage("empty", "没有找到匹配内容。请尝试更短的关键词，或清除部分筛选条件。");
    this.setStatus("没有找到匹配结果。");
  }

  private renderLoadError(): void {
    this.renderMessage(
      "error",
      "搜索索引暂时无法加载。请确认站点已经完成构建，并通过预览或正式地址访问。",
      true,
    );
    this.setStatus("搜索索引不可用。可重试加载，或先浏览全部文章。");
  }

  private renderSearchError(): void {
    this.renderMessage("error", "搜索过程中出现错误。你可以重试，或调整关键词后再次搜索。", true);
    this.setStatus("搜索失败，请重试。");
  }

  private renderMessage(
    kind: "idle" | "loading" | "empty" | "error",
    message: string,
    recoverable = false,
  ): void {
    this.resultLinks = [];
    this.activeIndex = -1;
    this.input.removeAttribute("aria-activedescendant");
    this.input.setAttribute("aria-expanded", "false");

    const panel = createElement(
      "div",
      kind === "error"
        ? "border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"
        : "border border-dashed border-slate-300 p-4 text-sm leading-6 text-slate-500 dark:border-slate-700 dark:text-slate-400",
    );
    panel.textContent = message;
    if (recoverable) {
      const actions = createElement("div", "mt-3 flex flex-wrap gap-3");
      const retry = createElement(
        "button",
        "min-h-11 border border-current px-3 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
      );
      retry.type = "button";
      retry.dataset.pagefindRetry = "";
      retry.textContent = "重新加载索引";
      const browse = createElement(
        "a",
        "inline-flex min-h-11 items-center px-3 font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
      );
      browse.href = "/articles/";
      browse.textContent = "浏览全部文章";
      actions.append(retry, browse);
      panel.append(actions);
    }
    this.output.replaceChildren(panel);
  }

  private setBusy(busy: boolean): void {
    this.root.setAttribute("aria-busy", String(busy));
  }

  private setStatus(message: string): void {
    this.status.textContent = message;
  }

  private updateClearButton(): void {
    this.clearButton.disabled = !this.hasCriteria();
  }

  private onInputKeydown(event: KeyboardEvent): void {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (this.resultLinks.length === 0) return;
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex =
        this.activeIndex < 0
          ? direction > 0
            ? 0
            : this.resultLinks.length - 1
          : (this.activeIndex + direction + this.resultLinks.length) % this.resultLinks.length;
      this.setActiveResult(nextIndex, true);
      return;
    }
    if (event.key === "Enter" && this.activeIndex >= 0) {
      event.preventDefault();
      this.resultLinks[this.activeIndex]?.click();
      return;
    }
    if (event.key === "Escape") {
      this.cancelDebounce();
      this.cancelCurrentQuery();
      this.setActiveResult(-1, false);
      this.root.dispatchEvent(new CustomEvent("pagefind-search-escape", { bubbles: true }));
    }
  }

  private setActiveResult(index: number, shouldScroll: boolean): void {
    this.activeIndex = index;
    this.resultLinks.forEach((link, resultIndex) => {
      const active = resultIndex === index;
      link.dataset.active = String(active);
      link.setAttribute("aria-selected", String(active));
      link.classList.toggle("border-blue-500", active);
      link.classList.toggle("bg-blue-50", active);
      link.classList.toggle("dark:bg-blue-950/40", active);
    });
    const activeLink = index >= 0 ? this.resultLinks[index] : undefined;
    if (activeLink) {
      this.input.setAttribute("aria-activedescendant", activeLink.id);
      if (shouldScroll) activeLink.scrollIntoView({ block: "nearest" });
    } else {
      this.input.removeAttribute("aria-activedescendant");
    }
  }

  destroy(): void {
    this.destroyed = true;
    this.cancelDebounce();
    this.cancelCurrentQuery();
    this.eventController.abort();
  }
}

export function initializePagefindSearch(): void {
  document.querySelectorAll<HTMLElement>("[data-pagefind-search]").forEach((root) => {
    if (controllers.has(root)) return;
    controllers.set(root, new PagefindSearchController(root));
  });
}

document.addEventListener("astro:page-load", initializePagefindSearch);
document.addEventListener("astro:before-swap", () => {
  controllers.forEach((controller) => controller.destroy());
  controllers.clear();
});

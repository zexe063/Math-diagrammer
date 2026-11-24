<script setup>
import { computed, onBeforeUnmount, ref, useId } from "vue";
import { diagramExamples } from "virtual:math-diagram-examples";

const props = defineProps({
  id: { type: String, default: "" },
  example: { type: Object, default: null },
  previewLabel: { type: String, default: "Preview" },
  codeLabel: { type: String, default: "Code" },
  showCode: { type: Boolean, default: true },
  showCaption: { type: Boolean, default: true },
  initialTab: {
    type: String,
    default: "preview",
    validator: value => ["preview", "code"].includes(value),
  },
});

const componentId = useId().replaceAll(":", "");
const activeTab = ref(props.showCode ? props.initialTab : "preview");
const copied = ref(false);
let copiedTimer;

const resolvedExample = computed(() => {
  const value = props.example ?? diagramExamples[props.id];
  if (!value) {
    throw new Error(`Unknown diagram documentation example: ${props.id || "(missing id)"}`);
  }
  return value;
});

const previewTabId = `diagram-preview-tab-${componentId}`;
const codeTabId = `diagram-code-tab-${componentId}`;
const previewPanelId = `diagram-preview-panel-${componentId}`;
const codePanelId = `diagram-code-panel-${componentId}`;
const copyLabel = computed(() => copied.value ? "Copied" : "Copy code");
const highlightedSource = computed(() => {
  if (resolvedExample.value.highlightedSource) return resolvedExample.value.highlightedSource;
  return resolvedExample.value.source.split("\n").map((line, index) => {
    const escaped = line
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
    return `<span class="line" data-line="${index + 1}">${escaped || " "}</span>`;
  }).join("\n");
});

function selectTab(tab) {
  if (tab === "code" && !props.showCode) return;
  activeTab.value = tab;
}

onBeforeUnmount(() => clearTimeout(copiedTimer));

function focusActiveTab() {
  const id = activeTab.value === "preview" ? previewTabId : codeTabId;
  document.getElementById(id)?.focus();
}

function handleTabKeydown(event) {
  if (!props.showCode) return;
  if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
    selectTab(activeTab.value === "preview" ? "code" : "preview");
    focusActiveTab();
  }
  if (["Home", "End"].includes(event.key)) {
    event.preventDefault();
    selectTab(event.key === "Home" ? "preview" : "code");
    focusActiveTab();
  }
}

async function copySource() {
  const source = resolvedExample.value.source;
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(source);
  } else if (typeof document !== "undefined") {
    const field = document.createElement("textarea");
    field.value = source;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  }
  copied.value = true;
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => { copied.value = false; }, 1600);
}
</script>

<template>
  <figure class="diagram-example">
    <figcaption
      v-if="showCaption && (resolvedExample.title || resolvedExample.description)"
      class="diagram-example__caption"
    >
      <strong v-if="resolvedExample.title" class="diagram-example__title">
        {{ resolvedExample.title }}
      </strong>
      <span v-if="resolvedExample.description" class="diagram-example__description">
        {{ resolvedExample.description }}
      </span>
    </figcaption>

    <div class="diagram-example__toolbar">
      <div
        class="diagram-example__tabs"
        role="tablist"
        aria-orientation="horizontal"
        :aria-label="`${resolvedExample.title || 'Diagram'} view`"
        @keydown="handleTabKeydown"
      >
        <button
          :id="previewTabId"
          class="diagram-example__tab"
          :class="{ 'diagram-example__tab--active': activeTab === 'preview' }"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'preview'"
          :aria-controls="previewPanelId"
          :tabindex="activeTab === 'preview' ? 0 : -1"
          @click="selectTab('preview')"
        >
          {{ previewLabel }}
        </button>
        <button
          v-if="showCode"
          :id="codeTabId"
          class="diagram-example__tab"
          :class="{ 'diagram-example__tab--active': activeTab === 'code' }"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'code'"
          :aria-controls="codePanelId"
          :tabindex="activeTab === 'code' ? 0 : -1"
          @click="selectTab('code')"
        >
          {{ codeLabel }}
        </button>
      </div>
      <button
        v-if="showCode && activeTab === 'code'"
        class="diagram-example__copy"
        type="button"
        :aria-label="copyLabel"
        @click="copySource"
      >
        <span aria-live="polite" aria-atomic="true">{{ copyLabel }}</span>
      </button>
    </div>

    <div class="diagram-example__shell">
      <section
        v-show="activeTab === 'preview'"
        :id="previewPanelId"
        class="diagram-example__panel diagram-example__preview-panel"
        role="tabpanel"
        :aria-labelledby="previewTabId"
        tabindex="0"
      >
        <div class="diagram-example__preview" v-html="resolvedExample.svg" />
      </section>

      <section
        v-if="showCode"
        v-show="activeTab === 'code'"
        :id="codePanelId"
        class="diagram-example__panel diagram-example__code-panel"
        role="tabpanel"
        :aria-labelledby="codeTabId"
        tabindex="0"
      >
        <pre><code
          :class="`language-${resolvedExample.language || 'js'}`"
          v-html="highlightedSource"
        /></pre>
      </section>
    </div>
  </figure>
</template>

<style scoped>
.diagram-example {
  --de-ink: #111318;
  --de-paper: #ffffff;
  --de-blue: #155eef;
  --de-border: #dde1e7;
  --de-code-bg: #f8fafc;
  --de-code-border: #e4e7ec;
  --de-code-text: #182230;
  box-sizing: border-box;
  max-width: 100%;
  min-width: 0;
  margin: 28px 0 48px;
}

:global(.dark) .diagram-example {
  --de-ink: #f2f4f7;
  --de-paper: #101828;
  --de-border: #344054;
  --de-code-bg: #161b26;
  --de-code-border: #344054;
  --de-code-text: #e4e7ec;
}

.diagram-example__caption {
  display: grid;
  gap: 4px;
  margin: 0 0 16px;
}

.diagram-example__title {
  color: var(--vp-c-text-1, #101114);
  font-size: 17px;
  line-height: 1.4;
}

.diagram-example__description {
  color: var(--vp-c-text-2, #4b5563);
  font-size: 14px;
  line-height: 1.55;
}

.diagram-example__shell {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--de-border);
  border-radius: 9px;
  background: var(--de-paper);
  box-shadow: none;
}

.diagram-example__toolbar {
  display: flex;
  min-height: 46px;
  align-items: center;
  justify-content: space-between;
}

.diagram-example__tabs {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 28px;
}

.diagram-example__tab,
.diagram-example__copy {
  border: 0;
  color: #667085;
  background: transparent;
  cursor: pointer;
  font-family: var(--vp-font-family-base);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0;
}

.diagram-example__tab {
  position: relative;
  min-height: 44px;
  padding: 0 3px;
}

.diagram-example__tab:hover {
  color: var(--de-ink);
}

.diagram-example__tab--active,
.diagram-example__tab--active:hover {
  color: var(--de-ink);
}

.diagram-example__tab--active::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  border-radius: 2px 2px 0 0;
  background: var(--de-ink);
  content: "";
}

.diagram-example__tab:focus-visible,
.diagram-example__copy:focus-visible {
  outline: 3px solid rgb(21 94 239 / 35%);
  outline-offset: 3px;
}

.diagram-example__copy {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  color: #344054;
  background: #ffffff;
}

.diagram-example__copy:hover {
  border-color: #98a2b3;
  color: var(--de-ink);
  background: #f9fafb;
}

.diagram-example__panel {
  min-width: 0;
}

.diagram-example__panel:focus-visible {
  outline: 3px solid rgb(21 94 239 / 45%);
  outline-offset: -3px;
}

.diagram-example__preview {
  display: grid;
  min-width: 0;
  min-height: 280px;
  max-width: 100%;
  place-items: center;
  box-sizing: border-box;
  overflow: hidden;
  padding: 28px;
  background: #ffffff;
}

.diagram-example__preview :deep(svg) {
  display: block;
  width: min(100%, 560px);
  min-width: 0;
  max-width: 100%;
  height: auto;
  max-height: 420px;
}

.diagram-example__code-panel,
.diagram-example pre {
  background: var(--vp-code-block-bg, var(--de-code-bg));
}

.diagram-example pre {
  max-height: 520px;
  margin: 0;
  overflow: auto;
  border-radius: 8px;
}

.diagram-example code {
  display: block;
  box-sizing: border-box;
  min-width: max-content;
  padding: 20px 24px;
  color: var(--de-code-text);
  background: transparent;
  font-family: "IBM Plex Mono", Consolas, monospace;
  font-size: 13px;
  line-height: 1.75;
  white-space: pre;
}

.diagram-example code :deep(span) {
  color: var(--shiki-light, inherit);
}

:global(.dark) .diagram-example code :deep(span) {
  color: var(--shiki-dark, inherit);
}

.diagram-example code :deep(.line) {
  display: inline;
  min-height: 23px;
}

@media (max-width: 640px) {
  .diagram-example {
    margin: 22px 0 38px;
  }

  .diagram-example__toolbar {
    min-height: 42px;
  }

  .diagram-example__tabs {
    gap: 22px;
  }

  .diagram-example__tab {
    min-height: 40px;
  }

  .diagram-example__copy {
    min-height: 32px;
    padding: 0 10px;
    font-size: 12px;
  }

  .diagram-example__preview {
    min-height: 220px;
    padding: 20px;
  }

  .diagram-example code {
    padding: 16px 18px;
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .diagram-example *,
  .diagram-example *::before,
  .diagram-example *::after {
    scroll-behavior: auto !important;
  }
}
</style>

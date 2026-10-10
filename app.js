(function () {
  "use strict";

  var DATA = window.GHOST_DATA;
  var ROUTES = ["overview", "components", "flows", "audit"];
  var MAX_ECHO = 40; // longest search text echoed back in messages

  var byId = {};
  DATA.components.forEach(function (c) { byId[c.id] = c; });

  var layerName = {};
  DATA.layers.forEach(function (l) { layerName[l.id] = l.name; });

  var state = {
    selectedId: null,
    flowId: DATA.flows[0].id,
    stepIndex: 0
  };

  // ---------- small DOM helpers (textContent only, never innerHTML with data) ----------
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === "text") node.textContent = attrs[key];
        else if (key === "className") node.className = attrs[key];
        else node.setAttribute(key, attrs[key]);
      });
    }
    (children || []).forEach(function (child) { if (child) node.appendChild(child); });
    return node;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function sourceLabel(source) {
    return source === "verified" ? "Verified in repo" : "AI knowledge, not yet verified";
  }

  function badge(source) {
    return el("span", {
      className: "badge " + (source === "verified" ? "badge-verified" : "badge-knowledge"),
      text: sourceLabel(source)
    });
  }

  function nodeButton(component, extraClass) {
    return el("button", {
      type: "button",
      className: "node" + (extraClass ? " " + extraClass : ""),
      "data-id": component.id,
      "data-source": component.source,
      "aria-label": component.name + ", " + layerName[component.layer] + ", " + sourceLabel(component.source)
    }, [
      el("span", { className: "node-name", text: component.name }),
      el("span", { className: "node-tech", text: component.tech })
    ]);
  }

  // ---------- Overview ----------
  function renderOverview() {
    document.getElementById("overview-tagline").textContent = DATA.system.tagline;
    document.getElementById("style-explained").textContent = DATA.system.styleExplained;

    var facts = [
      ["Style", DATA.system.style],
      ["Latest release", DATA.system.latestRelease],
      ["Node.js", DATA.system.nodeVersion],
      ["Languages", DATA.system.languages],
      ["Monorepo tooling", DATA.system.tooling],
      ["License", DATA.system.license]
    ];
    var grid = document.getElementById("fact-grid");
    clear(grid);
    facts.forEach(function (f) {
      grid.appendChild(el("div", { className: "fact" }, [
        el("p", { className: "fact-label", text: f[0] }),
        el("p", { className: "fact-value", text: f[1] })
      ]));
    });

    renderDiagram(document.getElementById("diagram"), { compact: false });
  }

  function renderDiagram(container, options) {
    clear(container);
    DATA.layers.forEach(function (layer) {
      var items = el("div", { className: "layer-items" });
      DATA.components
        .filter(function (c) { return c.layer === layer.id; })
        .forEach(function (c) { items.appendChild(nodeButton(c)); });

      container.appendChild(el("div", {
        className: "layer-row layer-" + layer.id,
        role: "group",
        "aria-label": layer.name
      }, [el("p", { className: "layer-name", text: layer.name }), items]));
    });

    if (!options.compact) {
      container.addEventListener("click", function (event) {
        var button = event.target.closest(".node");
        if (!button) return;
        state.selectedId = button.getAttribute("data-id");
        location.hash = "#components";
      });
    }
  }

  // ---------- Components: search form + detail panel ----------
  function renderLayerOptions() {
    var select = document.getElementById("layer-select");
    DATA.layers.forEach(function (layer) {
      select.appendChild(el("option", { value: layer.id, text: layer.name }));
    });
  }

  function matches(component, query, layer, status) {
    if (layer !== "all" && component.layer !== layer) return false;
    if (status !== "all" && component.source !== status) return false;
    if (!query) return true;
    var haystack = [component.name, component.tech, component.summary, component.repoPath, layerName[component.layer]]
      .join(" ").toLowerCase();
    return query.split(/\s+/).every(function (word) { return haystack.indexOf(word) !== -1; });
  }

  function shorten(text) {
    return text.length > MAX_ECHO ? text.slice(0, MAX_ECHO) + "…" : text;
  }

  function runSearch() {
    var raw = document.getElementById("search-input").value;
    var query = raw.trim().replace(/\s+/g, " ").toLowerCase().slice(0, 100);
    var layer = document.getElementById("layer-select").value;
    var status = document.getElementById("status-select").value;

    var results = DATA.components.filter(function (c) { return matches(c, query, layer, status); });
    var list = document.getElementById("component-list");
    var statusEl = document.getElementById("search-status");
    clear(list);

    if (results.length === 0) {
      list.appendChild(el("li", { className: "empty-state", text: "No components match. Try a shorter word or reset the filters." }));
      statusEl.textContent = query
        ? "No results for “" + shorten(raw.trim()) + "”."
        : "No components match these filters.";
      return;
    }

    results.forEach(function (c) {
      var li = el("li");
      li.appendChild(nodeButton(c, c.id === state.selectedId ? "is-selected" : ""));
      list.appendChild(li);
    });

    if (query) {
      statusEl.textContent = results.length + " of " + DATA.components.length +
        " components match “" + shorten(raw.trim()) + "”.";
    } else if (raw.length > 0) {
      statusEl.textContent = "Search was empty, so all matching components are shown (" + results.length + ").";
    } else {
      statusEl.textContent = "Showing " + results.length + " of " + DATA.components.length + " components.";
    }
  }

  function renderDetail(id) {
    var panel = document.getElementById("detail-panel");
    clear(panel);
    var c = byId[id];

    if (!c) {
      panel.appendChild(el("h2", { id: "detail-title", text: "Component details" }));
      panel.appendChild(el("p", { className: "hint", text: "Select a component to see what it does, where it lives in the repo, and the evidence for it." }));
      return;
    }

    var rows = [
      ["Layer", layerName[c.layer]],
      ["Technology", c.tech],
      ["Where in the repo", c.repoPath],
      ["Evidence", c.evidence]
    ];
    var dl = el("dl");
    rows.forEach(function (r) {
      dl.appendChild(el("dt", { text: r[0] }));
      dl.appendChild(el("dd", { text: r[1] }));
    });

    panel.appendChild(el("h2", { id: "detail-title", text: c.name }));
    panel.appendChild(badge(c.source));
    panel.appendChild(el("p", { text: c.summary }));
    panel.appendChild(dl);
  }

  function initComponents() {
    renderLayerOptions();

    document.getElementById("search-form").addEventListener("submit", function (event) {
      event.preventDefault();
      runSearch();
    });

    document.getElementById("reset-search").addEventListener("click", function () {
      document.getElementById("search-form").reset();
      runSearch();
      document.getElementById("search-input").focus();
    });

    document.getElementById("component-list").addEventListener("click", function (event) {
      var button = event.target.closest(".node");
      if (!button) return;
      state.selectedId = button.getAttribute("data-id");
      document.querySelectorAll("#component-list .node").forEach(function (n) {
        n.classList.toggle("is-selected", n === button);
      });
      renderDetail(state.selectedId);
    });

    runSearch();
  }

  // ---------- Flows ----------
  function currentFlow() {
    return DATA.flows.filter(function (f) { return f.id === state.flowId; })[0] || DATA.flows[0];
  }

  function renderFlow() {
    var flow = currentFlow();
    var total = flow.steps.length;
    state.stepIndex = Math.max(0, Math.min(state.stepIndex, total - 1));
    var step = flow.steps[state.stepIndex];
    var comp = byId[step.component];

    document.getElementById("step-count").textContent = "Step " + (state.stepIndex + 1) + " of " + total;
    document.getElementById("step-component").textContent = comp ? comp.name : step.component;
    document.getElementById("step-text").textContent = step.text;

    document.getElementById("prev-step").disabled = state.stepIndex === 0;
    document.getElementById("next-step").disabled = state.stepIndex === total - 1;

    var list = document.getElementById("step-list");
    clear(list);
    flow.steps.forEach(function (s, i) {
      var c = byId[s.component];
      var li = el("li", { text: (c ? c.name : s.component) + ": " + s.text });
      if (i === state.stepIndex) li.setAttribute("aria-current", "step");
      list.appendChild(li);
    });

    document.querySelectorAll("#flow-diagram .node").forEach(function (n) {
      n.classList.toggle("is-active", n.getAttribute("data-id") === step.component);
    });
  }

  function initFlows() {
    var select = document.getElementById("flow-select");
    DATA.flows.forEach(function (f) {
      select.appendChild(el("option", { value: f.id, text: f.name }));
    });
    select.addEventListener("change", function () {
      state.flowId = select.value;
      state.stepIndex = 0;
      renderFlow();
    });

    renderDiagram(document.getElementById("flow-diagram"), { compact: true });
    // The compact map is for display only; its nodes are not interactive.
    document.querySelectorAll("#flow-diagram .node").forEach(function (n) {
      n.setAttribute("tabindex", "-1");
      n.setAttribute("aria-hidden", "true");
      n.disabled = true;
    });

    document.getElementById("prev-step").addEventListener("click", function () {
      if (state.stepIndex > 0) { state.stepIndex -= 1; renderFlow(); }
    });
    document.getElementById("next-step").addEventListener("click", function () {
      if (state.stepIndex < currentFlow().steps.length - 1) { state.stepIndex += 1; renderFlow(); }
    });
    document.getElementById("restart-flow").addEventListener("click", function () {
      state.stepIndex = 0;
      renderFlow();
    });

    renderFlow();
  }

  // ---------- Audit ----------
  var STATUS_TEXT = { verified: "Verified", corrected: "Corrected", partial: "Partly verified", unverified: "Still unverified" };

  function renderAudit() {
    var counts = { verified: 0, corrected: 0, partial: 0, unverified: 0 };
    var body = document.getElementById("audit-body");
    clear(body);

    DATA.audit.forEach(function (row) {
      counts[row.status] = (counts[row.status] || 0) + 1;
      body.appendChild(el("tr", null, [
        el("td", { text: row.claim }),
        el("td", { text: row.initial }),
        el("td", { text: row.finding }),
        el("td", null, [el("span", {
          className: "badge badge-status-" + row.status,
          text: STATUS_TEXT[row.status] || row.status
        })])
      ]));
    });

    var summary = document.getElementById("audit-summary");
    clear(summary);
    [["verified", "claims verified"], ["corrected", "claims corrected"], ["partial", "partly verified"], ["unverified", "still unverified"]]
      .forEach(function (pair) {
        summary.appendChild(el("div", { className: "fact" }, [
          el("p", { className: "fact-label", text: pair[1] }),
          el("p", { className: "fact-value", text: String(counts[pair[0]]) })
        ]));
      });
  }

  // ---------- Router ----------
  function route() {
    var name = (location.hash || "#overview").slice(1) || "overview";
    var known = ROUTES.indexOf(name) !== -1;
    var target = known ? name : "notfound";

    document.querySelectorAll(".view").forEach(function (view) {
      view.hidden = view.id !== "view-" + target;
    });
    document.querySelectorAll("[data-route]").forEach(function (link) {
      if (link.getAttribute("data-route") === name) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    if (target === "components") {
      runSearch();
      renderDetail(state.selectedId);
    }

    var heading = document.querySelector("#view-" + target + " h1");
    document.title = (heading ? heading.textContent + " · " : "") + "Ghost Architecture Visualizer";
    document.getElementById("main").focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  // ---------- Start ----------
  renderOverview();
  initComponents();
  initFlows();
  renderAudit();
  window.addEventListener("hashchange", route);
  route();
})();

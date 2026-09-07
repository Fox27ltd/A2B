// Gridpick — serialisation. CSV that Excel opens without mangling anything.

(function (global) {
  "use strict";

  // Excel decides a leading =, +, - or @ means "formula". A scraped cell that
  // starts with one is how a spreadsheet ends up running something it shouldn't.
  const RISKY = /^[=+\-@\t\r]/;

  function cell(value, { forExcel = true } = {}) {
    let s = value == null ? "" : String(value);
    if (forExcel && RISKY.test(s)) s = "'" + s;
    if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  function toCsv(table, opts = {}) {
    const delim = opts.delimiter || ",";
    const lines = [];
    if (table.columns) lines.push(table.columns.map((c) => cell(c, opts)).join(delim));
    for (const row of table.rows) lines.push(row.map((c) => cell(c, opts)).join(delim));
    // CRLF + BOM: Excel on Windows needs both to read UTF-8 without garbling.
    return (opts.bom === false ? "" : "﻿") + lines.join("\r\n") + "\r\n";
  }

  function toTsv(table, opts = {}) {
    return toCsv(table, { ...opts, delimiter: "\t" });
  }

  function toJson(table) {
    const objects = table.rows.map((row) => {
      const o = {};
      table.columns.forEach((c, i) => { o[c] = row[i] === undefined ? "" : row[i]; });
      return o;
    });
    return JSON.stringify(objects, null, 2);
  }

  function toMarkdown(table) {
    const esc = (s) => String(s == null ? "" : s).replace(/\|/g, "\\|").replace(/\n/g, " ");
    const head = `| ${table.columns.map(esc).join(" | ")} |`;
    const rule = `| ${table.columns.map(() => "---").join(" | ")} |`;
    const body = table.rows.map((r) => `| ${r.map(esc).join(" | ")} |`);
    return [head, rule, ...body].join("\n");
  }

  const FORMATS = {
    csv: { fn: toCsv, ext: "csv", mime: "text/csv;charset=utf-8" },
    tsv: { fn: toTsv, ext: "tsv", mime: "text/tab-separated-values;charset=utf-8" },
    json: { fn: toJson, ext: "json", mime: "application/json" },
    markdown: { fn: toMarkdown, ext: "md", mime: "text/markdown" },
  };

  function serialise(table, format, opts) {
    const f = FORMATS[format] || FORMATS.csv;
    return { text: f.fn(table, opts), ext: f.ext, mime: f.mime };
  }

  function filename(table, ext, pageTitle) {
    const base = (pageTitle || "gridpick")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "gridpick";
    const stamp = new Date().toISOString().slice(0, 10);
    return `${base}-${stamp}.${ext}`;
  }

  global.Gridpick = Object.assign(global.Gridpick || {}, {
    toCsv, toTsv, toJson, toMarkdown, serialise, filename, FORMATS,
  });
})(typeof window !== "undefined" ? window : globalThis);

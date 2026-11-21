"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCatalog } from "@/lib/api";
import { EmptyState, ListSkeleton, Results, Toolbar, matches, norm } from "./Browse";
import { BookRow } from "./ui";

const NONE: never[] = [];

export function CatalogueBrowser() {
  const { data, loading } = useCatalog();
  const books = data?.books ?? NONE;
  const params = useSearchParams();
  const sorts = ["Relevance", "Available first", "Title A to Z", "Author A to Z"];
  const [q, setQ] = useState(params.get("q") ?? "");
  const [sort, setSort] = useState(sorts[0]);
  const [lang, setLang] = useState("All");
  const [cat, setCat] = useState("All");
  const categories = useMemo(() => Array.from(new Set(books.map((b) => b.category))), [books]);
  const reset = () => { setQ(""); setSort(sorts[0]); setLang("All"); setCat("All"); };

  const results = useMemo(() => {
    const t = norm(q);
    const r = books.filter((b) => (lang === "All" || b.language === lang) && (cat === "All" || b.category === cat) && matches(t, [b.title, b.titleMl, b.author, b.category]));
    if (sort === "Available first") r.sort((a, b) => Number(b.available > 0) - Number(a.available > 0));
    if (sort === "Title A to Z") r.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "Author A to Z") r.sort((a, b) => a.author.localeCompare(b.author));
    return r;
  }, [books, q, sort, lang, cat]);

  return (
    <>
      <Toolbar q={q} setQ={setQ} placeholder="Title, author or subject" sorts={sorts} sort={sort} setSort={setSort} count={results.length} total={books.length} noun="books" onReset={reset}
        filters={[{ label: "Languages", options: ["Malayalam", "English"], value: lang, set: setLang }, { label: "Subjects", options: categories, value: cat, set: setCat }]} />
      <Results>
        {loading ? <ListSkeleton rows /> : results.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((b) => <li key={b.id}><BookRow book={b} /></li>)}
          </ul>
        ) : (
          <EmptyState art="palmleaf" ml="പുസ്തകം കണ്ടെത്താനായില്ല"
            title={q ? `No books match “${q}”` : "No books match"}
            text="Check the spelling, try the author's name, or clear the filters. Ask at the desk and we may be able to bring it in." onReset={reset} />
        )}
      </Results>
    </>
  );
}

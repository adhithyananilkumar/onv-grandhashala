// An item's own page (event, class, book…). The layout draws it; the address says which one.
// One placeholder id lets the route be prepared ahead of time; every real id is rendered on demand.
export function generateStaticParams() {
  return [{ id: "preview" }];
}

export default function AdminItem() {
  return null;
}

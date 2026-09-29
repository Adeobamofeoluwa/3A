const VISITOR_ID_KEY = 'furniture_visitor_id'

export function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY)
  if (!id) {
    id = 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11)
    localStorage.setItem(VISITOR_ID_KEY, id)
  }
  return id
}

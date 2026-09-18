export const editorialEmail = "calorythm2026@gmail.com";

export function getEditorialContactUrl() {
  return process.env.NEXT_PUBLIC_EDITORIAL_CONTACT_URL?.trim() || `mailto:${editorialEmail}`;
}

export const removeHtmlTags = (str: string | null | undefined): string => {
    if (!str) return '';
    return str.replace(/<[^>]*>?/gm, '').trim();
};

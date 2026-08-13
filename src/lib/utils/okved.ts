export function matchOkved(userOkved: string, eventTags: string[]): boolean {
  const code = userOkved.split("—")[0]?.trim().split(".")[0];
  if (!code) return false;
  return eventTags.some((tag) => tag.includes(code) || tag.toLowerCase().includes("мебел"));
}

export function getOkvedRecommendationReason(userOkved: string): string {
  if (userOkved.includes("31.09") || userOkved.toLowerCase().includes("мебел")) {
    return "Подходит по ОКВЭД: производство мебели";
  }
  if (userOkved.includes("46.")) {
    return "Подходит по ОКВЭД: торговля";
  }
  return `Подходит по ОКВЭД: ${userOkved.split("—")[0]?.trim()}`;
}

export function matchInterests(userIndustries: string[] | undefined, eventIndustry: string): boolean {
  if (!userIndustries?.length) return false;
  const normalizedIndustry = eventIndustry.toLowerCase();
  return userIndustries.some((industry) => {
    const normalizedUserIndustry = industry.toLowerCase();
    return (
      normalizedIndustry.includes(normalizedUserIndustry) ||
      normalizedUserIndustry.includes(normalizedIndustry)
    );
  });
}

export function getInterestRecommendationReason(): string {
  return "Подходит по вашим интересам";
}

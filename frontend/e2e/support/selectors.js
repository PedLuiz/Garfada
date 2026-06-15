export function restaurantCard(page, restaurantId) {
  return page.getByTestId(`restaurant-card-${restaurantId}`)
}

export function userPreviewCard(page, userId) {
  return page.getByTestId(`user-preview-${userId}`)
}

$components = @(
  "accordion", "alert", "alert-dialog", "aspect-ratio", "avatar",
  "badge", "button", "calendar", "card", "checkbox", "collapsible",
  "command", "context-menu", "dialog", "dropdown-menu", "form",
  "hover-card", "input", "label", "menubar", "navigation-menu",
  "popover", "progress", "radio-group", "scroll-area", "select",
  "separator", "sheet", "skeleton", "slider", "switch", "table",
  "tabs", "textarea", "toast", "toggle", "tooltip"
)

foreach ($component in $components) {
  Write-Host "Installing $component..." -ForegroundColor Green
  npx shadcn@latest add $component -y
}

Write-Host "All components installed!" -ForegroundColor Cyan
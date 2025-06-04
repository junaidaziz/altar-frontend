import { Component } from "@angular/core";
import { RouterModule, Routes } from "@angular/router"; // Import Routes

// Import the page components
import { GeneratorPageComponent } from "./generator/generator.component";
import { PaymentsListComponent } from "./payments-list/payments-list.component";

export const routes: Routes = [
  { path: "", redirectTo: "/generator", pathMatch: "full" },
  {
    path: "generator",
    component: GeneratorPageComponent,
    title: "Grid Generator"
  },
  {
    path: "payments",
    component: PaymentsListComponent,
    title: "Payments History"
  },
  { path: "**", redirectTo: "/generator" }
];

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="main-container">
      <header class="app-header">
        <h1>{{ title }}</h1>
        <nav>
          <a routerLink="/generator" routerLinkActive="active-link">Generator</a>
          <a routerLink="/payments" routerLinkActive="active-link">Payments</a>
        </nav>
      </header>
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "Altar.io";

  // AppComponent no longer manages grid, code, bias, payments state directly.
  constructor() {}
}

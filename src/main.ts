import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { provideHttpClient } from "@angular/common/http";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { routes } from "./app/app.component"; // Import routes from app.component

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    // Configure the router with the defined routes
    provideRouter(routes, withComponentInputBinding())
  ]
}).catch(err => console.error(err));

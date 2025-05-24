// src/main.ts

import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { provideHttpClient } from "@angular/common/http"; // Import provideHttpClient

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient() // Provide HttpClient for the entire application
  ]
}).catch(err => console.error(err));

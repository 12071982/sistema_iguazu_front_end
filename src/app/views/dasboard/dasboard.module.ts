import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DasboardRoutingModule } from './dasboard-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { WelcomeComponent } from './welcome/welcome.component';


@NgModule({
  declarations: [
    LayoutComponent,
    SidenavComponent,
    HeaderComponent,
    FooterComponent,
    WorkspaceComponent,
    WelcomeComponent
  ],
  imports: [
    CommonModule,
    DasboardRoutingModule
  ]
})
export class DasboardModule { }

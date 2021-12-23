import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ZeroComponent } from './zero.component';
import { WindowRef } from './windowref.service';

@NgModule({
  declarations: [
    ZeroComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgbModule.forRoot()
  ],
  providers: [WindowRef],
  bootstrap: [ZeroComponent]
})
export class ZeroModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from './paginator/paginator.component';
import { SpinnerComponent } from './spinner/spinner.component';



@NgModule({
  declarations: [
    PaginatorComponent,
    SpinnerComponent
  ],
  imports: [
    CommonModule
  ],
    exports: [
        PaginatorComponent,
        SpinnerComponent
    ]
})
export class SharedModule { }

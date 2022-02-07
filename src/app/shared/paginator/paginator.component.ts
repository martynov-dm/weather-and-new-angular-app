import {Component, Input, OnInit} from '@angular/core';
import {NewsApiService} from "../../news-api/news-api.service";

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.css']
})
export class PaginatorComponent implements OnInit {
  @Input() numberOfPages!: number
  pageOptions!: number[]

  currentPage = 1

  constructor(private newsApiService: NewsApiService) {
  }

  ngOnInit(): void {
   this.calcPageOptions()
  }

  calcPageOptions() {
    this.pageOptions = [
      this.currentPage - 2,
      this.currentPage - 1,
      this.currentPage ,
      this.currentPage + 1,
      this.currentPage + 2,
    ].filter(pageNumber => pageNumber >= 1 && pageNumber <= this.numberOfPages)
  }

  onClick(pageNumber: number) {
    this.newsApiService.getPage(pageNumber)
    this.currentPage = pageNumber
    this.calcPageOptions()
  }
}

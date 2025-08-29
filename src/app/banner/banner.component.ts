import { Component } from '@angular/core';

@Component({
  selector: 'app-banner',
  standalone: false,
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css'
})
export class BannerComponent {
  public intervalId: any;
  public transitionEnabled = true;

  currentSlide = 0;
  slides = [
    {
      title: 'Banner 1',
      subtitle: 'Banner 1',
      cardImg: 'assets/Banner-A2.jpg',
      bgImg: 'images/Banner-A2.jpg'
    },
    {
      title: 'Banner 2',
      subtitle: 'Banner 2',
      cardImg: 'images/New BannerA3.jpg ',
      bgImg: 'images/New BannerA3.jpg '
    }, 
  ];

ngOnInit(): void {
   const lastSlide = this.slides[this.slides.length - 1];
  const firstSlide = this.slides[0];

  this.slides = [lastSlide, ...this.slides, firstSlide]; 

  this.currentSlide = 1;  

  this.intervalId = setInterval(() => this.nextSlide(), 4000);
}

nextSlide() {
  if (this.currentSlide >= this.slides.length - 1) {
    this.currentSlide++;

     setTimeout(() => {
      this.transitionEnabled = false;
      this.currentSlide = 1;

       setTimeout(() => {
        this.transitionEnabled = true;
      }, 500);
    }, 500);  
  } else {
    this.currentSlide++;
  }
}



prevSlide() {
  if (this.currentSlide <= 0) {
    this.currentSlide--;

    setTimeout(() => {
      this.transitionEnabled = false;
      this.currentSlide = this.slides.length - 2;

      setTimeout(() => {
        this.transitionEnabled = true;
      }, 50);
    }, 600);
  } else {
    this.currentSlide--;
  }
}


setSlide(index: number) {
  this.currentSlide = index + 1; 
}


  
}

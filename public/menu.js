$(document).ready(function() {
    $('.menu-link').bigSlide();

    //closes men when you click anywhere
    $('.container, #menu').click(function() {
      $('.menu-link').bigSlide().bigSlideApi
    });
});

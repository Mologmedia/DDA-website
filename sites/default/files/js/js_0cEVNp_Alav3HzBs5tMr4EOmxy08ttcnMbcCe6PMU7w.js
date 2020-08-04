  // JavaScript Document For The mega Menu
   
     
	   jQuery(".main-menu").accessibleMegaMenu({
			  /* prefix for generated unique id attributes, which are required 
				 to indicate aria-owns, aria-controls and aria-labelledby */
			  uuidPrefix: "accessible-megamenu",
  
			  /* css class used to define the megamenu styling */
			  menuClass: "nav-menu",
  
			  /* css class for a top-level navigation item in the megamenu */
			  topNavItemClass: "nav-item",
  
			  /* css class for a megamenu panel */
			  panelClass: "sub-nav",
  
			  /* css class for a group of items within a megamenu panel */
			  panelGroupClass: "sub-nav-group",
  
			  /* css class for the hover state */
			  hoverClass: "hover",
  
			  /* css class for the focus state */
			  focusClass: "focus",
  
			  /* css class for the open state */
			  openClass: "open"
		  });
		  
		  jQuery(document).ready(function(e) {
			 
		   
			  
		  jQuery('.main-menu li').each(function(index, element) {
			  if(jQuery(this).children('div').length > 0){
				  jQuery(this).find('> a').append('<span class="indicator">+</span>');
				  
				  
				  
				  jQuery(this).children('a').click(function(e) {
					 e.preventDefault();
				  });
				  
				  
			  }
			  
		  });
		  jQuery('#main_menu .nav-item>a').mouseleave(function(e) {
			  if(jQuery(this).parent().children('div').length > 0){
			 
			  }else{
				  
				  jQuery(this).blur();
			  }
		  });
		  // de focus when mouse leave, it was geting stucked
		  jQuery('#main_menu .nav-item').mouseleave(function(e) {
			  jQuery(this).children('a').blur();
		  })
		  // on focus open dropdown for norml element
		  jQuery('#main_menu .nav-item a').focus(function(e) {
					  if(jQuery(this).parent().children('div').length > 0){
						  if(jQuery(document).innerWidth() > 940){
							   jQuery(this).click();
						  }
			  }
			  
				 
			  });
			  
			  // On focus open dropdown for appended element
			  jQuery(document).on('focus', '#overflow_menu .nav-item a', function () {
				if(jQuery(this).parent().children('div').length > 0){
						  if(jQuery(document).innerWidth() > 940){
							   jQuery(this).click();
						  }
			  }
			  //alert(1);
			  });
			  
			  // On focus open dropdown script for the more button
			  jQuery(document).on('focus', '#btn-more-toggle', function () {
				jQuery(this).click();
			  
			  });
		  
		  });
		    
		  function menu_toggle(){
				      //alert(11111);
					  //$('.megamenu-wraper .container .showhide').css('display', 'block');
					  //$('.megamenu-wraper .container').prepend('');	
					  jQuery('.showhide').click(function(e) {
						  jQuery('#main_menu').stop().slideToggle('slow');
						  
					  });
					   
					  
					  /*$(document).on('click', '.indicator', function(){ 
						  //$(this).parent('a').next('div').stop().slideToggle('slow');
						  alert(1);
						  
					  });*/ 
					  
				  if(jQuery(document).innerWidth() < 940){
					  jQuery('.main-menu .nav-item a').click(function(e) {
						  jQuery(this).next('div').stop().slideToggle('slow');
					  });
					  
				
				  }
		  }
		  
		  //alert(jQuery(document).innerWidth());	
		  jQuery(window).resize(function(e){
				  if(jQuery(document).innerWidth() > 940){
						  
					  jQuery('.main-menu .nav-item').each(function(index, element) {
						  jQuery(this).children('a').removeClass('sub-nav');
					  })
						  jQuery('#main_menu').show();
						  jQuery('#main_menu').attr('style','');
					  
					  //$('.megamenu-wraper .container .showhide').css('display', 'none');
					  
				  }else{
					  //$('.megamenu-wraper .container .showhide').css('display', 'block');
					  
				  }
				  //alert(1);
				  
		  })
		 
		 //window.onload =  menu_toggle();
		   
  jQuery(document).ready(function(e) {
	  menu_toggle();
	    
	  //alert($('.carousel-wrapper').innerWidth());
	  if(jQuery(document).innerWidth()>940){
		  var t = jQuery('#main_menu').width();
		  var m = 0;
		  jQuery('#main_menu .nav-menu .nav-item').each(function(index, element) {
			  m = m + jQuery(this).width();
			  if(m>(t-100)){
			  jQuery('#btn-more-toggle').parent().remove();
			  jQuery(this).parent().append('<li class="btn-more-li"><a class="btn-more" id="btn-more-toggle" href="#">More</a></li>');
			  jQuery(".i18n-hi .btn-more").html("अधिक");
				  jQuery(this).remove();
				  jQuery('#overflow_menu ul.nav-menu').append('<li class="nav-item">'+jQuery(this).html()+'</li>');
			  }
		  });
		  
	  }else if(jQuery(document).innerWidth()<940){
		    var t = jQuery('#main_menu').width();
		    var m = 0;
		  	jQuery('.main_menu .nav-menu .nav-item').each(function(index, element) {
					  m = m + jQuery(this).width();
					  if(m>(t-100)){
					  jQuery('#btn-more-toggle').parent().remove();
					  jQuery(this).parent().append('<li class="btn-more-li"><a class="btn-more" id="btn-more-toggle" href="#">More</a></li>');
					  jQuery(".i18n-hi .btn-more").html("अधिक");
						  jQuery(this).remove();
						  jQuery('#overflow_menu ul.nav-menu').append('<li class="nav-item">'+jQuery(this).html()+'</li>');
					  }
				  });
		  
	  }else{
		  
		  jQuery('.main-menu .sub-nav').slideUp();
		  //jQuery('#main-menu').slideUp();
		  jQuery('.main-menu').slideUp();
	  }
	  
	 
	  jQuery('#overflow_menu').hide();
	  var oh = jQuery('#btn-more-toggle').height();
	  jQuery('#btn-more-toggle').click(function(e) {
		  //debugger;
		  //console.log($('#overflow_menu ul').height() + $('#main_menu').height());
		  e.preventDefault();
		  jQuery('#overflow_menu').stop().slideToggle(500);
		  var mHight = jQuery('#main_menu ul li').first().height();
		  jQuery(this).toggleClass('opened');
		  if(jQuery(this).hasClass('opened')){
			  var t = jQuery('#overflow_menu ul').height() + jQuery('#main_menu').height()+3;
			  jQuery(this).stop().animate({height: t+'px'},500);
		  }else{
			  jQuery(this).stop().animate({height: mHight+'px'},500);
		  }
	  });
  });;

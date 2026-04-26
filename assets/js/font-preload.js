(function(){
  var fonts = [
    'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap'
  ];
  fonts.forEach(function(href){
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    l.media = 'print';
    l.onload = function(){ this.media='all'; };
    document.head.appendChild(l);
  });
})();

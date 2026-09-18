/* Bird Cut — Analytics beacon (pageview + cart/purchase) */
(function(){
  var SID_KEY='bc_sid';
  var sid=localStorage.getItem(SID_KEY);
  if(!sid){ sid='bc_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8); try{localStorage.setItem(SID_KEY,sid);}catch(e){} }
  window.BC_sid=sid;
  function getUidEmail(){
    try{
      var t=localStorage.getItem('bc_token');
      if(!t) return {uid:null,email:''};
      var p=JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
      return {uid:p.id||null,email:p.email||''};
    }catch(e){ return {uid:null,email:''}; }
  }
  function send(event, meta){
    try{
      var ie=getUidEmail();
      var body={sessionId:sid, userId:ie.uid, event:event, path: location.pathname+location.search, referrer: document.referrer, meta: meta||{}};
      fetch('/api/track/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).catch(function(){});
    }catch(e){}
  }
  window.BC_track=send;
  // pageview
  function firePV(){ send('pageview', {title: document.title}); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',firePV);
  else firePV();
  window.BC_cartTrack=function(cart){
    var total=0; try{ total=cart.reduce(function(s,i){return s+(i.priceNum||0)*(i.qty||1);},0);}catch(e){}
    var ie=getUidEmail();
    send('cart_update',{items:cart, total: total, email: ie.email});
  };
  window.BC_addToCartTrack=function(item, cart){
    var ie=getUidEmail();
    send('add_to_cart',{item:item, items:cart, total: cart.reduce(function(s,i){return s+(i.priceNum||0)*(i.qty||1);},0), email: ie.email});
  };
  window.BC_beginCheckoutTrack=function(cart){
    var ie=getUidEmail();
    send('begin_checkout',{items:cart, total: cart.reduce(function(s,i){return s+(i.priceNum||0)*(i.qty||1);},0), email: ie.email});
  };
  window.BC_purchaseTrack=function(order){
    var ie=getUidEmail();
    send('purchase',{order:order, email: ie.email});
  };
})();

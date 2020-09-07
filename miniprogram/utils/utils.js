function debounce(fn,wait){
  let timer = null;
  return function(e){
    var args = arguments;
    var that = this;
    timer && clearTimeout(timer);
    timer = setTimeout(()=>{
      fn.call(that,e,args);
    },wait)
  }
}

module.exports = {
  debounce:debounce
} 
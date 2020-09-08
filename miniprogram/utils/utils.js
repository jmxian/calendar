function debounce(fn,wait){
  let timer = null
  return function(e){
    var args = arguments
    var that = this
    var now = !timer;
    timer && clearTimeout(timer)
    timer = setTimeout(()=>{
      timer = null;
    },wait)
    if(now){
      fn.apply(this,args);
    }
  }
}

module.exports = {
  debounce:debounce
} 
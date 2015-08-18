// Register Array.getUnique()
Array.prototype.unique = function() {
    var o = {};
    var i = this.length;
    var l = this.length;
    var r = [];

    for (i = 0; i < l; i += 1) {
        o[this[i]] = this[i];
    } 

    for (i in o) {
        r.push(o[i]);
    }
    
    return r;
};

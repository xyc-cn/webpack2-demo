/**
 * Created with JetBrains PhpStorm.
 * User: layenlin
 * Date: 14-3-20
 * Time: 下午2:04
 * To change this template use File | Settings | File Templates.
 */
/**
 * 字符串处理模块
 *
 * @class util/string
 */
define(function(require, exports, module) {
    /**
     * HTML编码
     *
     * @method encodeHTML
     * @param {String} str 待处理的字符串
     * @return {Strint} 编码后的字符串
     */
	exports.encodeHTML = function(str) {
		if(typeof str == 'string'){
			var ar = ['&', '&amp;', '<', '&lt;', '>', '&gt;', '"', '&quot;'];
			for (var i = 0; i < ar.length; i += 2){
				str = str.replace(new RegExp(ar[i], 'g'), ar[1 + i]);
			}
			return str;
		}
		return str;
	}
});

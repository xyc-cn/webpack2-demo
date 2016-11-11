<template>
    <div>
        <div>this is vue page</div>
    </div>
</template>
<style>
    body {
        background-color: #ff0000;
    }
</style>
<script>
    import {encodeHTML} from 'util/string_es6'
    import 'css/index.css'
    console.log(encodeHTML); //不加上这句，encodeHTML不会不打进来
    console.log('hello world');
    export default{
       /* data(){ //这样的写法编译会出错，暂时找不到原因
            return {
                msg: 'hello vue'
            }
        },
        components: {}*/
        data: function () {
            return {
                msg: 'hello vue'
            }
        },
        components: {}
    }
</script>

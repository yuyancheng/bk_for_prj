<template xmlns:v-bind="http://www.w3.org/1999/xhtml" xmlns:v-on="http://www.w3.org/1999/xhtml">
        <div class="load-control" slot="upload-wrap">
            <input type="file" v-on:change="fileSelected($event)"/>
            <a v-bind:style="{zIndex: isLoading ? 2 : 0}">
                <b>上传{{isLoading ? ('中(' + loadSize + '%)') : ''}}</b>
                <span v-bind:style="{width: loadSize + '%'}"></span>
            </a>
        </div>
</template>

<script type="text/ecmascript-6">

    import Vue from 'vue';
    import axios from 'axios';

    let modal = Vue.component('v-upload', {
        template: '#main',
        props: ['vuData'],                      // vuData 为注册方传递过来的数据
        components: {
            'form-element': ''
        },
        beforeCreate: function (bus) {
        },
        created: function (bus) {
            this.thisVDT = this['vuData'];
        },
        mounted: function () {
            console.log(this.$slots.default[0].tag);
        },
        methods: {
            submit () {
                this.$el.submit();

                let config = {
                    headers: {'Content-Type': 'multipart/form-data'},
                    onUploadProgress: this.setProgress
                };
                axios.post('/ddt2/rptWsRun/importFile', this.form, config).then(response => {
                    console.log(response.data);
                });
            },
            frLoaded (dt) {
                this.actionUrl = this.thisVDT.url;
            },
            // 选择上传文件
            fileSelected (e) {
                let that = this;
                let evt = e || window.event;
                let target = evt.target || evt.srcElement;
                let files = target.files;
                let file = target.files[0];
                let nameStr = file.name.split('.');
                let surfix = nameStr[nameStr.length - 1].toLocaleString();
                this.form = new FormData();      // 定义上传的表单

                that.hasLoaded = false;

                // ////////////////////////////上传配置/////////////////////////////

                for (let i = 0; i < files.length; i++) {
                    // 判别文件的相关属性
                    if (surfix !== 'xlsx') {
                        this.hasError = true;
                        this.errorStr = '您所上传的文件格式不正确，请修正为xlsx文件格式后重新上传！';
                        this.isDisabled = true;
                        return false;
                    } else if ((file.size / 1024 / 1024).toFixed(2) > 10) {
                        this.hasError = true;
                        this.errorStr = '文件大小不能超过10M，系统无法为您分配足够的计算资源！';
                        this.isDisabled = true;
                        return false;
                    } else {
                        this.hasError = false;
                    }

                    this.form.append('file[' + i + ']', files[i], files[i].name);
                }
            },
            success (dt) {
            }
        },
        data () {
            return {
                thisVDT: null,
                actionUrl: '',
                hasNoData: false,
                isLoading: false,
                hasLoaded: false,
                hasError: false,
                errorStr: '',
                loadSize: 0
            };
        }
    });

    export default modal;
</script>

<style lang="less" type="text/less" scoped>

</style>

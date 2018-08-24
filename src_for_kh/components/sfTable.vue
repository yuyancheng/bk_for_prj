<template lang="pug">
.sf-table-top
  .sf-table
    el-table(:data="tData",:border="type == 'border' ? true:false",:stripe="type == 'stripe' ? true:false",v-loading="this.$store.state.global.loading",@sort-change="sortable",@selection-change="selectionChange",ref="multipleTable",show-overflow-tooltip="true"
    )
      //- slot(name="checkbox")
      slot(name="expand")
      el-table-column(v-if="tableSearch && Array.isArray(tableSearch.selection)",type="selection")
      slot(name="a")
      el-table-column(v-for="column in tColumns",:key='column.prop',:prop="column.prop",:label="column.label",:sortable="column.sortable",:width="column.width")
      slot
      slot(name="actions")
    el-pagination.is-background(v-if="tableSearch && tableSearch.pageSize", @size-change="handleSizeChange",
      @current-change="handleCurrentChange",
      :page-sizes="[10, 20, 50]",
      :current-page="tableSearch.currentPage",
      :page-size="tableSearch.pageSize",
      layout="total, sizes, prev, pager, next, jumper",
      :total="tableSearch ? tableSearch.total:0")
</template>
<script>
export default {
    name: 'bdp-table',
    props: ['title', 'tColumns', 'tData', 'excel', 'tableSearch', 'type'],
    data() {
        return {
        };
    },
    methods: {
        handleSizeChange(val) {
      // this.$emit('search', {
      //   pageSize: val,
      // });
            this.tableSearch.pageSize = val;
        },
        handleCurrentChange(val) {
      // this.$emit('search', {
      //   currentPage: val,
      // });
            this.tableSearch.currentPage = val;
        },
        searchAction() {
            this.$emit('search', {
                key: this.select.selected,
                value: this.filter,
            });
        },
        selectionChange(val) {
            this.tableSearch.selection = val;
        },
        sortable(val) {
            this.tableSearch.order = val.order;
            this.tableSearch.prop = val.prop;
            this.$emit('search', {});
        },
        buttonClick(type) {
            this.$emit('search', {
                type: 'button',
                text: type,
            });
        },
        restSearch() {
            this.$emit('search', {
                type: 'restSearch',
            });
        },
        handleIconClick() {
            this.$emit('search', {
                type: 'keyWordChange',
            });
        },
        exportExcel() {
            this.$emit('search', { type: 'excel', name: this.excel });
        },
    },
    mounted() {
      // console.log(this.tColumns);
    },
    watch: {
        'tableSearch.selection': {
            handler() {
                if (this.tableSearch.selection.length === 0) {
                    this.$refs.multipleTable.clearSelection();
                }
        // console.log('hello');
        // this.$emit('search', {});
            },
            deep: true,
        },
        'tableSearch.currentPage': {
            handler() {
                if (this.tableSearch.selection.length === 0) {
                    this.$refs.multipleTable.clearSelection();
                }
                this.$emit('search', {});
            },
            deep: true,
        },
        'tableSearch.pageSize': {
            handler() {
                if (this.tableSearch.selection.length === 0) {
                    this.$refs.multipleTable.clearSelection();
                }
                this.$emit('search', {});
            },
            deep: true,
        },
    // selection() {
    //   if (this.selection.selection.length === 0) {
    //     this.$refs.multipleTable.clearSelection();
    //   }
    // },
    },
};
</script>
<style lang="scss">
/* 表格样式 */

.sf-table {
    // border: 1px solid $border-color;
    .table-expand {
      label{
        color: #99a9bf;
      }
    }
    .el-table {
  // border-radius: 5px;
  th {
    background: '#E397D';
    padding: 10px 0;
    min-width: 120px;
    // border-right: 1px solid #efefef;
    // padding-top: 10.5px;
    // padding-bottom: 10.5px;
    &>.cell {
        text-align: left;
        color: #333;
        font-weight: bold;
        .el-checkbox {
            padding-left: 6px;
        }

        white-space: nowrap;
    }
    }
    td {
      padding: 10px 0;
      border-color: #efefef;
      button {
        padding: 3px 10px;
        font-size: 10px;
      }
    }
    a {
      color: $pr;
      text-decoration: none;
    }
  }
    border-radius: $border-radius;
    .is-background {
      text-align: right;
      margin-top: 5px;
    }
    // .el-pagination {
    //     border-top: 1px solid #efefef;
    //     padding:18px 0;
    //     text-align: center;
    //     input {
    //         line-height:26px;
    //     }
    //    .btn-prev {
    //         border: 1px solid $border-color;
    //         border-right: none;
    //         padding-right: 5px;
    //     }
    //     .btn-next {
    //         border: 1px solid $border-color;
    //         border-left: none;
    //          padding-left: 5px;
    //     }
    //     .el-pager {
    //         .number {
    //             border: 1px solid $border-color;
    //             color: $font-color;
    //             font-weight: 100;
    //             border-right: none;
    //             &:last-child {
    //                 border-right: 1px solid $border-color;
    //             }
    //             &:hover,&.active {
    //                 color: #fff;
    //                 background: $pr;
    //             }
    //         }
    //     }
    // }
}

</style>

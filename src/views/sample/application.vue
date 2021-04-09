<template>
  <div class="app-container">
    <el-table :data="allCustomers" style="width: 100%">
      <el-table-column label="Mã nhân viên" width="180">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span style="margin-left: 10px">{{ getEmployeeCode(scope) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Họ và tên" width="180">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span style="margin-left: 10px">{{ getFullname(scope) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Địa chỉ email">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span style="margin-left: 10px">{{ getEmail(scope) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <div class="block">
      <span class="demonstration">All combined</span>
      <el-pagination
        :current-page.sync="currentPage4"
        :page-sizes="[100, 200, 300, 400]"
        :page-size="100"
        layout="total, sizes, prev, pager, next, jumper"
        :total="400"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Application',
  data() {
    return {
      customerByIds: {
        'OQ97KM': {
          customerId: 1,
          employeeCode: 'ANVKD5',
          email: 'thomas@daniel.uk',
          phone: '889-554-555',
          fullname: 'Anandi'
        },
        'F5AF63': {
          customerId: 2,
          employeeCode: 'ANVKD5',
          email: 'thomas@daniel.us',
          phone: '889-554-555',
          fullname: 'Thomas Dani'
        },
        '45A6A4': {
          customerId: 3,
          employeeCode: 'ANVKD5',
          email: 'thomas@daniel.jp',
          phone: '889-554-555',
          fullname: 'Thomas Daniel'
        }
      },
      allCustomers: ['OQ97KM', 'F5AF63', '45A6A4'],
      currentPage4: 4
    }
  },
  created() {

  },
  methods: {
    getEmployeeCode(scope) {
      return this.customerByIds[scope.row].employeeCode
    },
    getFullname(scope) {
      return this.customerByIds[scope.row].fullname
    },
    getEmail(scope) {
      return this.customerByIds[scope.row].email
    },
    handleSizeChange(val) {
      console.log(`${val} items per page`)
    },
    handleCurrentChange(val) {
      console.log(`current page: ${val}`)
    }
  }
}
</script>

<style>

</style>

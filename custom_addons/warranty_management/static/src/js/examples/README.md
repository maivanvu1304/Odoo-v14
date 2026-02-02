# 📚 Advanced JavaScript Widget Examples - Hướng Dẫn Sử Dụng

## 📂 Các File Đã Tạo

### 1. **many2many_widget_example.js**
Widget hiển thị quan hệ Many2many dưới dạng tags có thể thêm/xóa

**Tính năng:**
- ✅ Hiển thị tags với màu sắc tùy chỉnh
- ✅ Thêm/xóa items trong edit mode
- ✅ Mở dialog chọn records
- ✅ Support cả readonly và edit mode

**Cách sử dụng:**
```xml
<field name="spare_part_ids" 
       widget="many2many_custom_tags"
       options="{'color': 'primary', 'allow_create': true}"/>
```

---

### 2. **one2many_widget_example.js**
Widget hiển thị quan hệ One2many dưới dạng bảng

**Tính năng:**
- ✅ Hiển thị dạng table với columns tùy chỉnh
- ✅ Thêm/sửa/xóa dòng
- ✅ Format values theo type (float, date, many2one)
- ✅ Tính tổng tiền (getTotalAmount method)

**Cách sử dụng:**
```xml
<field name="service_line_ids" widget="one2many_custom_list">
    <tree editable="bottom">
        <field name="name"/>
        <field name="quantity"/>
        <field name="price"/>
    </tree>
</field>
```

---

### 3. **editable_widget_example.js**
Chứa 2 editable widgets: Rating và Progress Bar

#### 3a. Rating Widget (Đánh giá sao)
**Tính năng:**
- ✅ Readonly mode: Hiển thị stars màu vàng
- ✅ Edit mode: Click để thay đổi rating
- ✅ Support half stars
- ✅ Hover preview

**Cách sử dụng:**
```xml
<field name="customer_rating" 
       widget="editable_rating"
       options="{'max_rating': 5, 'allow_half': true}"/>
```

#### 3b. Progress Bar Widget
**Tính năng:**
- ✅ Progress bar 0-100%
- ✅ Click để thay đổi giá trị
- ✅ Màu sắc tự động (đỏ/vàng/xanh)

**Cách sử dụng:**
```xml
<field name="completion_progress" widget="editable_progress"/>
```

---

### 4. **external_library_widgets.js**
Widget tích hợp Chart.js

**Tính năng:**
- ✅ Hiển thị biểu đồ bar/pie/line
- ✅ Tự động load Chart.js library
- ✅ Parse dữ liệu từ JSON field
- ✅ Responsive chart

**Cách sử dụng:**
```xml
<field name="chart_data" 
       widget="chart_widget"
       options="{'chart_type': 'bar', 'height': 300}"/>
```

**Dữ liệu JSON format:**
```json
{
  "labels": ["Jan", "Feb", "Mar"],
  "datasets": [{
    "label": "Sales",
    "data": [10, 20, 30]
  }]
}
```

---

### 5. **widget_lifecycle_demo.js**
Widget demo tất cả lifecycle methods

**8 Lifecycle Methods:**
1. `init()` - Constructor, khởi tạo biến
2. `willStart()` - Load data/libraries (async, before DOM)
3. `start()` - After DOM insertion
4. `on_attach_callback()` - When attached to DOM
5. `_render()` - Render UI
6. `updateState()` - When state changes
7. `on_detach_callback()` - When detached
8. `destroy()` - Final cleanup

**Cách sử dụng:**
```xml
<field name="demo_field" 
       widget="lifecycle_demo"
       options="{'debug': true}"/>
```

**Check console log để xem thứ tự gọi các methods!**

---

## 🔧 Cài Đặt

### Bước 1: Copy Files
Copy tất cả các file `.js` vào:
```
warranty_management/static/src/js/examples/
```

### Bước 2: Khai Báo trong assets.xml
Tạo hoặc update file `views/assets.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <template id="assets_backend" inherit_id="web.assets_backend">
        <xpath expr="." position="inside">
            <!-- Widget examples -->
            <script src="/warranty_management/static/src/js/examples/many2many_widget_example.js" type="text/javascript"/>
            <script src="/warranty_management/static/src/js/examples/one2many_widget_example.js" type="text/javascript"/>
            <script src="/warranty_management/static/src/js/examples/editable_widget_example.js" type="text/javascript"/>
            <script src="/warranty_management/static/src/js/examples/external_library_widgets.js" type="text/javascript"/>
            <script src="/warranty_management/static/src/js/examples/widget_lifecycle_demo.js" type="text/javascript"/>
        </xpath>
    </template>
</odoo>
```

### Bước 3: Update __manifest__.py
```python
{
    'name': 'Warranty Management',
    'data': [
        # ... other files ...
        'views/assets.xml',
    ],
}
```

### Bước 4: Restart Odoo + Update Module
```bash
# Restart Odoo server
# Then update module in Odoo UI
```

---

## 📖 Học Từng Phần

### Tuần 1: Many2many & One2many Widgets
1. Đọc `many2many_widget_example.js`
2. Đọc `one2many_widget_example.js`
3. Tạo widget tương tự cho models của bạn
4. Thử nghiệm các options khác nhau

### Tuần 2: Editable Widgets
1. Đọc `editable_widget_example.js`
2. Hiểu sự khác biệt giữa `_renderReadonly()` và `_renderEdit()`
3. Tạo widget editable cho use case của bạn (slider, color picker, etc.)

### Tuần 3: External Libraries
1. Đọc `external_library_widgets.js`
2. Hiểu cách load library trong `willStart()`
3. Tích hợp Select2 hoặc DateRangePicker
4. Thử nghiệm với libraries khác

### Tuần 4: Lifecycle Mastery
1. Đọc `widget_lifecycle_demo.js`
2. Chạy widget và xem console log
3. Hiểu thứ tự gọi các methods
4. Apply vào widgets của bạn

---

## 🎯 Bài Tập Thực Hành

### Bài 1: Custom Color Picker Widget
Tạo widget để chọn màu sắc (editable)
- Readonly: Hiển thị màu đã chọn
- Edit: Hiển thị color picker

### Bài 2: Tags Input Widget
Tạo widget nhập tags (giống chip input)
- Cho phép thêm/xóa tags
- Autocomplete từ danh sách có sẵn

### Bài 3: Image Gallery Widget
Tạo widget hiển thị Many2many images
- Readonly: Grid of images
- Edit: Upload + delete images

### Bài 4: Dashboard Widget với Chart.js
Tạo dashboard widget với multiple charts
- Load data từ RPC
- Hiển thị pie + bar charts
- Refresh button

---

## 🐛 Troubleshooting

### Widget không hiển thị
- ✅ Check assets.xml đã khai báo file JS chưa
- ✅ Clear browser cache (Ctrl + F5)
- ✅ Check console log có lỗi không

### External library không load
- ✅ Check internet connection (CDN)
- ✅ Check `willStart()` có return Promise không
- ✅ Check library URL đúng không

### Widget không update khi giá trị thay đổi
- ✅ Check `_setValue()` có được gọi không
- ✅ Check `updateState()` có implement đúng không

---

## 📚 Next Steps

Sau khi nắm vững 4 concepts này, tiếp tục học:
1. **Custom Controllers** - Customize List/Form/Kanban controllers
2. **QWeb Templates** - Dynamic rendering
3. **Client Actions** - Dashboard actions
4. **Performance Optimization** - Caching, lazy loading

Chúc bạn học tốt! 🚀

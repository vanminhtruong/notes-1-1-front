from pathlib import Path
import subprocess
from html import escape
base=Path(r"C:\Users\ASUS\Documents\plant\duan\Front")
css=(base/"src/pages/NoteTrash/NoteTrash.scss").read_text(encoding="utf-8")
out=base/".nt-preview"
out.mkdir(exist_ok=True)
chrome=r"C:\Program Files\Google\Chrome\Application\chrome.exe"
for theme,width,height in [('light',1360,960),('dark',1360,960),('dark-black',1360,960),('dark-black',500,900)]:
    page=f"""<!doctype html><html class="{theme}"><meta charset="utf-8">
    <style>body{{margin:0;font-family:Arial,sans-serif}}{css}</style>
    <div class="note-trash-page"><div class="nt-container">
      <nav class="nt-breadcrumb"><a class="nt-back">← Bảng điều khiển</a> › <span>Thùng rác ghi chú</span></nav>
      <section class="nt-workspace">
       <header class="nt-header"><div class="nt-header-primary">
        <div class="nt-hero-icon">▤</div><div class="nt-heading"><h1>Thùng rác ghi chú</h1>
        <p>Ghi chú đã xóa được giữ lại 30 ngày trước khi hệ thống tự động dọn dẹp.</p></div></div>
        <div class="nt-retention">◷ <span><strong>30</strong> ngày</span><span class="nt-retention-label">lưu giữ</span></div>
       </header>
       <div class="nt-content">
        <div class="nt-toolbar"><label class="nt-search"><span style="position:absolute;top:13px;left:15px;color:gray">⌕</span><input placeholder="Tìm kiếm ghi chú đã xóa..."></label>
         <div class="nt-toolbar-actions"><span class="nt-count">▤ <strong>8</strong> ghi chú</span>
          <button class="nt-button nt-button-outline-danger">♧ Dọn sạch thùng rác</button></div></div>
        <div class="nt-tip"><span>ⓘ</span><p>Bạn có thể khôi phục ghi chú trước khi hết hạn. Ghi chú đã xóa vĩnh viễn sẽ không thể lấy lại.</p></div>
        <div class="nt-list-header"><label class="nt-select-all"><input type="checkbox">Chọn tất cả trên trang</label><span>8 mục</span></div>
        <div class="nt-list">
          {''.join(f"""<article class="nt-note">
           <label class="nt-note-checkbox"><input type="checkbox"></label>
           <div class="nt-document-icon">▤</div>
           <div class="nt-note-description"><h2>{escape(title)}</h2><div class="nt-note-date">▦ Đã xóa: 05/11/2026</div></div>
           <div class="nt-expiry"><span class="nt-expiry-badge{' nt-expiry-soon' if idx == 1 else ''}">◷ Còn {3 if idx==1 else 26} ngày</span>
           <span class="nt-expiry-date">Hạn xóa: 05/12/2026</span></div>
           <div class="nt-row-actions"><button class="nt-button nt-button-restore">↺ Khôi phục</button>
           <button class="nt-button nt-button-delete-icon">⌫</button></div></article>"""
          for idx,title in enumerate(['Danh sách công việc tuần này','Ý tưởng phát triển sản phẩm mới','Ghi chú cuộc họp vào ngày thứ ba','Công thức nấu ăn và nguyên liệu cần chuẩn bị']))}
        </div>
       </div>
      </section></div></div>
    </html>"""
    suffix=f"{theme}-{width}"
    html=out/(suffix+".html"); img=out/(suffix+".png")
    html.write_text(page,encoding="utf-8")
    args=[chrome,"--headless=new","--disable-gpu","--hide-scrollbars","--no-first-run",f"--user-data-dir={out / ('profile-'+suffix)}",f"--window-size={width},{height}",f"--screenshot={img}",html.as_uri()]
    try:
        subprocess.run(args,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=22,check=False)
        print(suffix, img.exists(), img.stat().st_size if img.exists() else 0)
    except Exception as e: print(suffix,"FAILED",str(e)[:100])

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

# 受け取るデータの型を定義


class SegmentData(BaseModel):
    segment: int
    active: bool


# FastAPIアプリケーションの作成
app = FastAPI()

# "static"フォルダを静的ファイルとしてマウント
app.mount("/static", StaticFiles(directory="static"), name="static")

# "templates"フォルダをテンプレートとして設定
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    """
    ルートURL(http://127.0.0.1:8000)にアクセスがあった場合にindex.htmlを返す
    """
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/send_data")
async def receive_data(data: SegmentData):
    """
    フロントエンドからPOSTリクエストで送られてきたデータを受け取る
    """
    segment_number = data.segment
    is_active = data.active
    print(f"タッチされたセグメント: {segment_number}, アクティブ状態: {is_active}")

    # ここで受け取った数値を使って、Python側でさらに処理を追加できる

    return {"status": "success", "received_data": segment_number, "active_status": is_active}

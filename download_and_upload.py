import os
import tempfile
import json
import yt_dlp
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# מזהה התיקייה בגוגל דרייב אליה יועלו הקבצים
DRIVE_FOLDER_ID = "1YQyaFzviICv8F-iiSjE9Sd6PrGzpBPXs"

# תוכן קובץ העוגיות שלך נשאר כאן
cookies_content = """__Secure-ROLLOUT_TOKEN	CNqU6YyP_u_JvQEQqL3qpbvwkAMYyKudrLvwkAM%3D	.youtube.com	/	2026-05-13T01:13:46.819Z	64	✓	✓	None	https://youtube.com		Medium
AEC	AaJma5s3QSRg5hmbZaqilTq8rNMmRI1zqULHCnqPLlG9uahFJqPTXcmNfw	.google.com	/	2026-05-13T01:13:46.823Z	61	✓	✓	Lax			Medium
DV	w8RsnNQhz6ocoLzqnEwKQNChaM_-pxk	www.google.com	/	2025-11-14T01:23:52.000Z	33						Medium
GPS	1	.youtube.com	/	2025-11-14T01:43:33.248Z	4	✓	✓				Medium
NID	526=pFaWeGLkrAck3H95RIpW2Bk0jvedNrQh9Gc1o8S4egghPBYQh-YgH9vI5tOaab0B3QOn9Y96PXVRSXJZsCPXfjiEGYPikBHQqgvLHKe0iZxxEH2rBFuyNJV_eZLNA1ZNyh2QFQ1EnGZdtPZrYBoz9ceHt3YnYI2LBc9w_riOBdp9txGRbqOKPWK0JOp1v2h8H67qERoGk8yi1GUzGlgCWfu0kGBRDvWSbLkW8JK6_z7BHKrIbWSjdmgEEw	.google.com	/	2026-05-16T01:13:45.903Z	257	✓	✓	None			Medium
PREF	tz=Asia.Jerusalem&f4=4000000	.youtube.com	/	2026-12-19T01:13:54.295Z	32		✓				Medium
VISITOR_INFO1_LIVE	HqBlp_RDem8	.youtube.com	/	2026-05-13T01:13:46.818Z	29	✓	✓	None	https://youtube.com		Medium
VISITOR_PRIVACY_METADATA	CgJJTBIEGgAgOA%3D%3D	.youtube.com	/	2026-05-13T01:13:46.819Z	44	✓	✓	None	https://youtube.com		Medium
YSC	cgqLuhlPbGs	.youtube.com	/	Session	14	✓	✓	None	https://youtube.com		Medium

"""

def upload_to_drive(filename):
    """מעלה קובץ לתיקיית גוגל דרייב ספציפית"""
    if not filename or not os.path.exists(filename):
        print(f"הקובץ לא נמצא: {filename}")
        return
        
    try:
        # טוען את פרטי ההתחברות מתוך משתנה הסביבה (Secret)
        service_account_info = json.loads(os.getenv("GOOGLE_SERVICE_ACCOUNT"))
        creds = service_account.Credentials.from_service_account_info(
            service_account_info,
            scopes=['https://www.googleapis.com/auth/drive.file']
        )
        service = build('drive', 'v3', credentials=creds)
        
        file_metadata = {
            'name': os.path.basename(filename),
            'parents': [DRIVE_FOLDER_ID]
        }
        media = MediaFileUpload(filename)
        
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id'
        ).execute()
        
        print(f"העלאה לדרייב הצליחה. File ID: {file.get('id')}")
    except Exception as e:
        print(f"אירעה שגיאה במהלך ההעלאה ל-Google Drive: {e}")


def download_media(video_url, format_choice):
    """מוריד מדיה מהקישור הנתון באמצעות yt-dlp"""
    cookie_file_path = None
    downloaded_file = None
    try:
        # יוצר קובץ עוגיות זמני
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt', encoding='utf-8') as temp_cookie_file:
            temp_cookie_file.write(cookies_content)
            cookie_file_path = temp_cookie_file.name

        ydl_opts = {
            'outtmpl': '%(title)s.%(ext)s',
            'cookiefile': cookie_file_path,
            'noplaylist': True,
        }

        if format_choice == 'mp3':
            # מנסה להוריד MP3 ישירות. ייתכן שיוריד פורמט אודיו אחר אם MP3 לא זמין.
            ydl_opts['format'] = 'bestaudio[ext=mp3]/bestaudio'
            ydl_opts['postprocessors'] = [] # הסרת postprocessor של FFmpeg
        elif format_choice == 'mp4':
            ydl_opts['format'] = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'
        else:
            print(f"פורמט לא נתמך: {format_choice}. מוריד כ-MP4 כברירת מחדל.")
            ydl_opts['format'] = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=True)
            downloaded_file = ydl.prepare_filename(info)
            print(f"ההורדה הצליחה: {downloaded_file}")
            return downloaded_file

    except yt_dlp.utils.DownloadError as e:
        print(f"שגיאת הורדה מ-yt-dlp: {e}")
    except Exception as e:
        print(f"אירעה שגיאה בלתי צפויה במהלך ההורדה: {e}")
    finally:
        # מנקה את קובץ העוגיות הזמני
        if cookie_file_path and os.path.exists(cookie_file_path):
            os.remove(cookie_file_path)
    return None


if __name__ == "__main__":
    try:
        with open("link.txt", "r") as f:
            video_url = f.read().strip()
        with open("format.txt", "r") as f:
            format_choice = f.read().strip()
        
        if not video_url:
            print("הקובץ link.txt ריק. התהליך נעצר.")
        else:
            print(f"מתחיל הורדה עבור הקישור: {video_url} בפורמט: {format_choice}")
            downloaded_filename = download_media(video_url, format_choice)
            
            if downloaded_filename and os.path.exists(downloaded_filename):
                print(f"מתחיל העלאה של '{downloaded_filename}' ל-Google Drive.")
                upload_to_drive(downloaded_filename)
                
                # מנקה את הקובץ שהורד מהשרת
                os.remove(downloaded_filename)
                print(f"הקובץ המקומי נמחק: {downloaded_filename}")
            else:
                print("ההורדה נכשלה, מדלג על שלב ההעלאה.")

    except FileNotFoundError:
        print("קובץ link.txt או format.txt לא נמצא.")
    except Exception as e:
        print(f"אירעה שגיאה בתהליך הראשי: {e}")

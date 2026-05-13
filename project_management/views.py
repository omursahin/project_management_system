from django.views.generic import TemplateView
from pathlib import Path
from django.conf import settings
from django.http import HttpResponse


class FrontendView(TemplateView):
    """
    Frontend React uygulamasini servis eden view.
    Build edilmis index.html dosyasini okur ve render eder.
    """

    def get(self, request, *args, **kwargs):
        try:
            index_path = Path(settings.BASE_DIR) / 'frontend' / 'dist' / 'index.html'

            with open(index_path, 'r', encoding='utf-8') as f:
                html_content = f.read()

            return HttpResponse(html_content)
        except FileNotFoundError:
            return HttpResponse(
                """
                <h1>Frontend build bulunamadi.</h1>
                <p>Lutfen frontend dizininde <code>npm run build</code> komutunu calistirin.</p>
                """,
                status=404
            )

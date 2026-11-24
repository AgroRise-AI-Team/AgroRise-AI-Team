"""
AgroRise AI - News Analyzer API Views
Provides endpoints for retrieving and refreshing AI-analyzed agricultural news.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .ml.news_analyzer import get_analyzed_agricultural_news


class AgriNewsListView(APIView):
    """
    GET /api/news/latest/
    Returns AI-analyzed agricultural news with category, sentiment,
    impact rating, and actionable advisories.
    Optional query params:
      - category: filter by category name
      - impact: filter by 'HIGH', 'MEDIUM', 'LOW'
      - crop: filter by crop name
      - refresh: 'true' to force live refresh
    """
    permission_classes = [AllowAny]

    def get(self, request):
        force_refresh = request.query_params.get("refresh", "false").lower() in ("true", "1")
        category = request.query_params.get("category", "").strip().lower()
        impact = request.query_params.get("impact", "").strip().upper()
        crop = request.query_params.get("crop", "").strip().lower()

        try:
            data = get_analyzed_agricultural_news(force_refresh=force_refresh)
            articles = data.get("articles", [])

            # Apply filters if provided
            if category:
                articles = [a for a in articles if category in a.get("category", "").lower()]

            if impact:
                articles = [a for a in articles if a.get("impact_level", "").upper() == impact]

            if crop:
                articles = [
                    a for a in articles
                    if any(crop in c.lower() for c in a.get("affected_crops", []))
                ]

            return Response({
                "status": "success",
                "last_updated": data.get("last_updated"),
                "total": len(articles),
                "articles": articles
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Failed to retrieve agricultural news: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AgriNewsRefreshView(APIView):
    """
    POST /api/news/refresh/
    Forces an immediate live re-analysis bypassing the cache.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data = get_analyzed_agricultural_news(force_refresh=True)
            return Response({
                "status": "success",
                "message": "AI News Analysis refreshed successfully.",
                "last_updated": data.get("last_updated"),
                "total": len(data.get("articles", [])),
                "articles": data.get("articles", [])
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Failed to refresh news: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace FishRelease.Infrastructure.Services;

public record TikTokOEmbedResponse(
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("author_name")] string AuthorName,
    [property: JsonPropertyName("author_url")] string AuthorUrl,
    [property: JsonPropertyName("thumbnail_url")] string ThumbnailUrl,
    [property: JsonPropertyName("html")] string Html
);

public class TikTokOEmbedService
{
    private readonly HttpClient _httpClient;

    public TikTokOEmbedService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<TikTokOEmbedResponse?> GetVideoMetadataAsync(string videoUrl)
    {
        try
        {
            var endpoint = $"https://www.tiktok.com/oembed?url={Uri.EscapeDataString(videoUrl)}";
            return await _httpClient.GetFromJsonAsync<TikTokOEmbedResponse>(endpoint);
        }
        catch
        {
            return null;
        }
    }
}

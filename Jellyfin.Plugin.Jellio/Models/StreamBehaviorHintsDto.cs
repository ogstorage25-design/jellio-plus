using System.Text.Json.Serialization;

namespace Jellyfin.Plugin.Jellio.Models;

public class StreamBehaviorHintsDto
{
    [JsonPropertyName("notWebReady")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public bool? NotWebReady { get; set; }

    [JsonPropertyName("bingeGroup")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? BingeGroup { get; set; }

    [JsonPropertyName("filename")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Filename { get; set; }
}

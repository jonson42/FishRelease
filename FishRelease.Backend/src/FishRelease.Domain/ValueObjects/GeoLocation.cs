using System;

namespace FishRelease.Domain.ValueObjects;

public record GeoLocation
{
    public double Latitude { get; init; }
    public double Longitude { get; init; }

    public GeoLocation(double latitude, double longitude)
    {
        if (latitude is < -90 or > 90)
            throw new ArgumentOutOfRangeException(nameof(latitude), "Vĩ độ (Latitude) phải nằm trong khoảng [-90, 90]");

        if (longitude is < -180 or > 180)
            throw new ArgumentOutOfRangeException(nameof(longitude), "Kinh độ (Longitude) phải nằm trong khoảng [-180, 180]");

        Latitude = latitude;
        Longitude = longitude;
    }
}

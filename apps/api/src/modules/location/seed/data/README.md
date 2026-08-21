# India Location Master Data

This directory contains the versioned India location master used by Sportora.

Hierarchy:

India
└── State / Union Territory
    └── District
        └── City

The application must not depend on tournaments existing in a city.
Location records are independent master data.

Coordinates are WGS-84 latitude/longitude and are used for
future nearby-location queries.

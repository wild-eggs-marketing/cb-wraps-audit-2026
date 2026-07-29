# Data files needed here

## ez-cater-orders.csv
Weekly export from EZ Cater catering portal, filtered for Wild Eggs brand only.
Expected columns: Order Number, Event Date, Location, Food Total, Status, Caterer Name, Store Name, Source, City, State, Zip Code, Driver.

## store-urls.csv
Wild Eggs store name to Toast catering URL mapping. Already populated with confirmed slugs and fallback URLs for unconfirmed stores.

Six Toast catering URL slugs still need verification:
- Westport (slug: wildeggs-westport, no hyphen between eggs and westport)
- Mercantile (slug: wild-eggs-mercantile — verify not downtown-louisville)
- Jtown (slug: wild-eggs-j-town — verify hyphenation)
- Middletown/Landis Lakes (slug: wild-eggs-landis-lakes — verify not middletown)

Nine locations currently routed to the general wildeggs.com/catering fallback because their Toast catering slugs are not confirmed:
New Albany, Jeffersonville, Evansville, Carmel, Pulliam, Fishers, Avon, Greenwood, Oakley, Queen City.

Add the specific Toast slugs to store-urls.csv as they become available.

## multi-store-consolidation.csv
Multi-store Wild Eggs accounts (Traders Point Christian Church has three sites, Brown Cancer Center has four store affiliations, and a handful more). One master row per account with the assigned owner. TO CREATE.

# shopify-room-layout

## Features

- can layout a room with walls
- calculates the wall length in feet and inches
- can add and remove wall points
- the walls must close
- added angles to the walls but doesnt work currently
- ctrl click and drag to unsnap the grid

## Want to add

- [x] Zoom buttons & display at the bottom to keep track of reference size
- [x] scale grid when zooming in and out to keep sizes relative - needs optimization
- [x]add a cancel or complete button to close the window
- add a debug mode with the elements turned on or off depending on the debug mode
- [O]logging
- make the boxes smaller because its more about the walls than the connection points
- Add a way to save a load layouts - first to local storage then to database
- [x] add a hover box around the points to allow for more options to be added


## Shopify System
### user frontend 
    - Button
      - text options
        - calculate Layout
        - plan your layout
        - create your space
    - user app overlay
### admin frontend
    - connect to products
    - set the price multiplier
    - connect the output data to your product data
    - save layout option
    - configure the look and feel of the app
      - bg color
      - grid or dots
      - grid color
      - dot color
      - summary window color scheme
      - summary window placement?
    - configure the overlay options
      - angles
      - text style
      - text color
      - point size & color
### user app overlay
    - Modal popup
    - darken background
    - hook up buttons to save or cancel

### data pass through and update 
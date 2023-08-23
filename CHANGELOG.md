# 2.0.1

* fixes to support pretalx 2023.1.0
    * use non-deprecated gettext call
    * safe timezone handling
    * usage of pyproject.toml

# 2.0.0

* room info page can now show more content on the lower half of the view
    * **BREAKING:** The option to select which content should be shown
      is now a ChoiceField, the old setting will be ignored.
* **BREAKING:** lower thirds now use css selectors using the same rules
  as the other css selectors
    * `#l3box` is now `#broadcast_tools_lower_thirds_box`
    * `#l3info_line` is now `#broadcast_tools_lower_thirds_infoline`
    * `#l3speaker` is now `#broadcast_tools_lower_thirds_speaker`
    * `#l3title` is now `#broadcast_tools_lower_thirds_title`
    * `.lower3rd` is now `broadcast_tools_lower_thirds`

# 1.1.0

* add a "room info" page to show conference attendees the currently running talk
* fix more compatibility issues with pretalx 2.3.x

# 1.0.4

* fix compatibility with pretalx 2.3.x
* always localize text using the selected default event locale

# 1.0.3

* fix a bug where questions could not be sorted

# 1.0.2

* fix compatibility issue with pretalx 2.3.1

# 1.0.1

* fix version identifier in setup.py

# 1.0.0

* PDF export: contains talk details, notes and answers to questions
* Lower Thirds: containing talk details to embed in a stream or recording

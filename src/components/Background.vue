<script setup lang="ts">
import type { Background } from '@/types';
import { googleEarthImageIds } from '@/utils/googleEarth';
import { computed } from 'vue';
  
const { background } = defineProps<{
  background: Background
}>()

const backgroundStyle = computed(() => ({
  background: `url('${background.image}')`,
  backgroundRepeat: background.repeat ? 'repeat' : 'no-repeat',
  backgroundPosition: background.centre ? 'center' : 'initial',
  backgroundAttachment: background.fixed ? 'fixed' : 'initial',
  backgroundSize: background.stretch ? 'cover' : 'auto',
  position: 'fixed' as const,
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  zIndex: -1,
}));

const MILLISECONDS_TO_HOURS = 1000 * 60 * 60;
const UNSPLASH_REFRESH_INTERVAL_HOURS = 3;
const GOOGLE_EARTH_REFRESH_INTERVAL_HOURS = 1;


    const setGoogleEarthDetails = (data: { country?: string; region?: string; geocode?: { country?: string; locality?: string }; zoom: string; lat?: string; lng?: string; attribution?: string }) => {
        let country = data.country ? data.country : data.geocode ? data.geocode.country : "Unknown country";
        let locality = data.region ? data.region : data.geocode ? data.geocode.locality ? data.geocode.locality : "Unknown locality" : "Unknown locality";
        let zoom = parseInt(data.zoom);
        // let googleEarthDetails = $('<a />', {
        //     title: "Open location in Google Maps",
        //     target: "_blank",
        //     href: `https://www.google.com/maps/@?api=1&map_action=map&center=${data.lat},${data.lng}&zoom=${zoom}&basemap=satellite`,
        //     text: `${locality}, ${country}`
        // });
        // $('#settings-style-background-google-earth-details-location').empty().append(googleEarthDetails);
        // $('#settings-style-background-google-earth-details-copyright').text(data.attribution);
        // $('#settings-style-background-google-earth-details').show();
    };

    const fetchBackgroundImage = async () => {
        let backgroundImageCSS = [];
        let imageSetting = background.image;
        if (imageSetting) {
            if (imageSetting.substr(0,8) === "unsplash") {
                $("#settings-style-background-refresh").prop("disabled", false);
                let lastImage = background.lastImage;
                let backgroundImage = null;
                let query = "";
                if (lastImage !== undefined && lastImage !== null) {
                    if (lastImage.unsplash) {
                        let lastTime = Date.parse(lastImage.queryTime);
                        if (!Number.isNaN(lastTime)) {
                            let hoursSinceNewPhoto = (new Date() - lastTime) / MILLISECONDS_TO_HOURS;
                            if (hoursSinceNewPhoto < UNSPLASH_REFRESH_INTERVAL_HOURS) {
                                backgroundImage = lastImage.urls.full;
                            }
                        }
                        if (lastImage.lastQuery !== imageSetting) {
                            backgroundImage = null;
                        }
                    }
                }
                if (backgroundImage === null) {
                    let queryString = imageSetting.substr(9);
                    if (imageSetting.substr(8,1) === ":") {
                        query = `&featured=true&query=${queryString}`;
                    } else if (imageSetting.substr(8,1) === "#") {
                        query = `&collections=${queryString}`;
                    } else if (imageSetting.substr(8,1) === "@") {
                        query = `&username=${queryString}`;
                    }
                    $.ajax({
                        url: `https://api.unsplash.com/photos/random?client_id=ayAIqsDDYvD6bdwA00jgwlFKvMwBwF23i6ZudDqYhOA&content_filter=high${query}`,
                        // headers: handle.headers,
                        dataType: "json",
                        success: function(resp, stat, xhr) {
                            let ajaxCSS = [];
                            var backgroundImage = resp.urls.full;
                            ajaxCSS.push("html {\n"
                                    + "    background-image: url(" + backgroundImage + ");\n"
                                    + "    background-repeat: " + (settings.style["background"].repeat ? "" : "no-") + "repeat;\n"
                                    + "    background-position: " + (settings.style["background"].centre ? "center" : "initial") + ";\n"
                                    + "    background-attachment: " + (settings.style["background"].fixed ? "fixed" : "initial") + ";\n"
                                    + "    background-size: " + (settings.style["background"].stretch ? "cover" : "auto") + ";\n"
                                    + "}");
                            $(document.head).append($("<style/>").text(ajaxCSS.join("\n")));
                            resp.queryTime = (new Date()).toISOString();
                            resp.lastQuery = imageSetting;
                            resp.unsplash = true;
                            settings.style["background"].lastImage = resp;
                            // write to local storage
                            try {
                                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
                            } catch {
                                console.error("Unable to save after fetching Unsplash background");
                            }
                        },
                        error: function(xhr, stat, err) {
                            // ajaxCount([0]);
                        }
                    });
                }
            } else if (imageSetting.substr(0,4) === "nasa") {
                // https://api.nasa.gov/planetary/apod?api_key=QifgtiYGafK80FR7BzzpNPfyHjqxO564AuGnxfnb
                let lastImage = background.lastImage;
                let backgroundImage = null;
                if (lastImage !== undefined && lastImage !== null) {
                    if (lastImage.nasaDate) {
                        let currentTime = new Date();
                        let year = currentTime.getFullYear();
                        let month = (currentTime.getMonth() + 1 + "").padStart(2, "0");
                        let date = (currentTime.getDate() + "").padStart(2, "0");
                        let todaysDate = `${year}-${month}-${date}`;
                        if (lastImage.nasaDate === todaysDate) {
                            backgroundImage = lastImage.hdurl;
                        }
                    }
                }
                if (backgroundImage === null) {
                    $.ajax({
                        url: `https://api.nasa.gov/planetary/apod?api_key=QifgtiYGafK80FR7BzzpNPfyHjqxO564AuGnxfnb`,
                        dataType: "json",
                        success: function(resp, stat, xhr) {
                            let ajaxCSS = [];
                            var backgroundImage = resp.hdurl;
                            ajaxCSS.push("html {\n"
                                    + "    background-image: url(" + backgroundImage + ");\n"
                                    + "    background-repeat: " + (settings.style["background"].repeat ? "" : "no-") + "repeat;\n"
                                    + "    background-position: " + (settings.style["background"].centre ? "center" : "initial") + ";\n"
                                    + "    background-attachment: " + (settings.style["background"].fixed ? "fixed" : "initial") + ";\n"
                                    + "    background-size: " + (settings.style["background"].stretch ? "cover" : "auto") + ";\n"
                                    + "}");
                            $(document.head).append($("<style/>").text(ajaxCSS.join("\n")));
                            resp.queryTime = (new Date()).toISOString();
                            resp.lastQuery = imageSetting;
                            resp.nasaDate = resp.date;
                            settings.style["background"].lastImage = resp;
                            // write to local storage
                            try {
                                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
                            } catch {
                                console.error("Unable to save after fetching NASA APOD background");
                            }
                        },
                        error: function(xhr, stat, err) {
                            // ajaxCount([0]);
                        }
                    });
                }
            } else if (imageSetting.substr(0,12) === "google-earth") {
                // $("#settings-style-background-refresh").prop("disabled", false);
                // https://www.gstatic.com/prettyearth/assets/data/v3/{imageID}.json
                let lastImage = background.lastImage;
                let backgroundImage = null;
                if (lastImage !== undefined && lastImage !== null) {
                    if (lastImage.googleEarth) {
                        let lastTime = Date.parse(lastImage.queryTime);
                        if (!Number.isNaN(lastTime)) {
                            let hoursSinceNewPhoto = (new Date() - lastTime) / MILLISECONDS_TO_HOURS;
                            if (hoursSinceNewPhoto < GOOGLE_EARTH_REFRESH_INTERVAL_HOURS) {
                                backgroundImage = lastImage.dataUri;
                                setGoogleEarthDetails(lastImage);
                            }
                        }
                    }
                }
                if (backgroundImage === null) {
                    var randomImageID = googleEarthImageIds[Math.floor(Math.random() * googleEarthImageIds.length)];
                    $.ajax({
                        url: `https://www.gstatic.com/prettyearth/assets/data/v3/${randomImageID}.json`,
                        dataType: "json",
                        success: function(resp, stat, xhr) {
                            let ajaxCSS = [];
                            var backgroundImage = resp.dataUri;
                            ajaxCSS.push("html {\n"
                                    + "    background-image: url(" + backgroundImage + ");\n"
                                    + "    background-repeat: " + (settings.style["background"].repeat ? "" : "no-") + "repeat;\n"
                                    + "    background-position: " + (settings.style["background"].centre ? "center" : "initial") + ";\n"
                                    + "    background-attachment: " + (settings.style["background"].fixed ? "fixed" : "initial") + ";\n"
                                    + "    background-size: " + (settings.style["background"].stretch ? "cover" : "auto") + ";\n"
                                    + "}");
                            $(document.head).append($("<style/>").text(ajaxCSS.join("\n")));
                            resp.queryTime = (new Date()).toISOString();
                            resp.lastQuery = imageSetting;
                            resp.googleEarth = true;
                            settings.style["background"].lastImage = resp;
                            // write to local storage
                            try {
                                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
                            } catch {
                                console.error("Unable to save after fetching Google Earth background");
                            }
                            setGoogleEarthDetails(resp);
                        },
                        error: function(xhr, stat, err) {
                            // ajaxCount([0]);
                        }
                    });
                }
            }
        }
    }

</script>

<template>
  <div class="background" :style="backgroundStyle"></div>
</template>

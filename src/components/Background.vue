<script setup lang="ts">
import type { Background } from '@/types';
import { googleEarthImageIds } from '@/utils/googleEarth';
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps<{
  background: Background
}>();

const emit = defineEmits<{
  (e: 'update:lastImage', value: any): void
}>();

const resolvedImageUrl = ref<string | null>(null);

const backgroundStyle = computed(() => {
  const imageUrl = resolvedImageUrl.value ?? props.background.image;
  return {
  background: imageUrl ? `url('${imageUrl}')` : 'none',
  backgroundRepeat: props.background.repeat ? 'repeat' : 'no-repeat',
  backgroundPosition: props.background.centre ? 'center' : 'initial',
  backgroundAttachment: props.background.fixed ? 'fixed' : 'initial',
  backgroundSize: props.background.stretch ? 'cover' : 'auto',
  position: 'fixed' as const,
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  zIndex: -1,
  };
});

const MILLISECONDS_TO_HOURS = 1000 * 60 * 60;
const UNSPLASH_REFRESH_INTERVAL_HOURS = 3;
const GOOGLE_EARTH_REFRESH_INTERVAL_HOURS = 1;

const parseGoogleEarthDetails = (data: { country?: string; region?: string; geocode?: { country?: string; locality?: string }; zoom: string; lat?: string; lng?: string; attribution?: string }) => {
  const country = data.country ?? data.geocode?.country ?? 'Unknown country';
  const locality = data.region ?? data.geocode?.locality ?? 'Unknown locality';
  const zoom = parseInt(data.zoom);
  return {
    geoCountry: country,
    geoLocality: locality,
    geoZoom: zoom,
    geoLat: data.lat,
    geoLng: data.lng,
    geoAttribution: data.attribution,
  };
};

const fetchBackgroundImage = async () => {
  const imageSetting = props.background.image;
  if (!imageSetting) return;

  if (imageSetting.startsWith('unsplash')) {
    const lastImage = props.background.lastImage;
    let backgroundImage: string | null = null;
    let query = '';

    if (lastImage?.unsplash) {
      const lastTime = Date.parse(lastImage.queryTime);
      if (!Number.isNaN(lastTime)) {
        const hoursSinceNewPhoto = (Date.now() - lastTime) / MILLISECONDS_TO_HOURS;
        if (hoursSinceNewPhoto < UNSPLASH_REFRESH_INTERVAL_HOURS) {
          backgroundImage = lastImage.urls.full;
        }
      }
      if (lastImage.lastQuery !== imageSetting) {
        backgroundImage = null;
      }
    }

    if (backgroundImage === null) {
      const queryString = imageSetting.substring(9);
      if (imageSetting[8] === ':') {
        query = `&featured=true&query=${encodeURIComponent(queryString)}`;
      } else if (imageSetting[8] === '#') {
        query = `&collections=${encodeURIComponent(queryString)}`;
      } else if (imageSetting[8] === '@') {
        query = `&username=${encodeURIComponent(queryString)}`;
      }
      try {
        const response = await fetch(
          `https://api.unsplash.com/photos/random?client_id=ayAIqsDDYvD6bdwA00jgwlFKvMwBwF23i6ZudDqYhOA&content_filter=high${query}`
        );
        if (response.ok) {
          const data = await response.json();
          backgroundImage = data.urls.full;
          emit('update:lastImage', {
            ...data,
            queryTime: new Date().toISOString(),
            lastQuery: imageSetting,
            unsplash: true,
          });
        }
      } catch (err) {
        console.error('Failed to fetch Unsplash background', err);
      }
    }

    if (backgroundImage) {
      resolvedImageUrl.value = backgroundImage;
    }

  } else if (imageSetting.startsWith('nasa')) {
    // https://api.nasa.gov/planetary/apod?api_key=QifgtiYGafK80FR7BzzpNPfyHjqxO564AuGnxfnb
    const lastImage = props.background.lastImage;
    let backgroundImage: string | null = null;

    if (lastImage?.nasaDate) {
      const now = new Date();
      const todaysDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (lastImage.nasaDate === todaysDate) {
        backgroundImage = lastImage.hdurl;
      }
    }

    if (backgroundImage === null) {
      try {
        const response = await fetch(
          'https://api.nasa.gov/planetary/apod?api_key=QifgtiYGafK80FR7BzzpNPfyHjqxO564AuGnxfnb'
        );
        if (response.ok) {
          const data = await response.json();
          backgroundImage = data.hdurl;
          emit('update:lastImage', {
            ...data,
            queryTime: new Date().toISOString(),
            lastQuery: imageSetting,
            nasaDate: data.date,
          });
        }
      } catch (err) {
        console.error('Failed to fetch NASA APOD background', err);
      }
    }

    if (backgroundImage) {
      resolvedImageUrl.value = backgroundImage;
    }

  } else if (imageSetting.startsWith('google-earth')) {
    // https://www.gstatic.com/prettyearth/assets/data/v3/{imageID}.json
    const lastImage = props.background.lastImage;
    let backgroundImage: string | null = null;

    if (lastImage?.googleEarth) {
      const lastTime = Date.parse(lastImage.queryTime);
      if (!Number.isNaN(lastTime)) {
        const hoursSinceNewPhoto = (Date.now() - lastTime) / MILLISECONDS_TO_HOURS;
        if (hoursSinceNewPhoto < GOOGLE_EARTH_REFRESH_INTERVAL_HOURS) {
          backgroundImage = lastImage.dataUri;
        }
      }
    }

    if (backgroundImage === null) {
      const randomImageID = googleEarthImageIds[Math.floor(Math.random() * googleEarthImageIds.length)];
      try {
        const response = await fetch(
          `https://www.gstatic.com/prettyearth/assets/data/v3/${randomImageID}.json`
        );
        if (response.ok) {
          const data = await response.json();
          backgroundImage = data.dataUri;
          emit('update:lastImage', {
            ...data,
            queryTime: new Date().toISOString(),
            lastQuery: imageSetting,
            googleEarth: true,
            ...parseGoogleEarthDetails(data),
          });
        }
      } catch (err) {
        console.error('Failed to fetch Google Earth background', err);
      }
    }

    if (backgroundImage) {
      resolvedImageUrl.value = backgroundImage;
    }
  }
};

onMounted(() => {
  fetchBackgroundImage();
});

watch(() => props.background.image, () => {
  resolvedImageUrl.value = null;
  fetchBackgroundImage();
});

watch(() => props.background.lastImage, (val) => {
  if (val === null || val === undefined) {
    fetchBackgroundImage();
  }
});

</script>

<template>
  <div class="background" :style="backgroundStyle"></div>
</template>

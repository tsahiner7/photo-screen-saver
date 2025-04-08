import classNames from "classnames"
import { useEffect, useReducer, useRef } from "react"
import { Transition, TransitionGroup } from "react-transition-group"
import { getFlickrPhotos } from "./flickrPhotos"
import { getLocalPhotos } from "./localPhotos"
import { Photo } from "./photo"
import styles from "./photoSlideshow.module.scss"
import { getUnsplashPhotos } from "./unsplashPhotos"
import { closeWindow, delay, getRandom, shuffle } from "./utils"

// Choose the source for the photos you want to display:
type GetPhotosFn = typeof getFlickrPhotos | typeof getUnsplashPhotos | typeof getLocalPhotos
const GET_PHOTOS: GetPhotosFn = getLocalPhotos

// Keep these in sync with photoSlideshow.module.scss:
const PHOTO_INTERVAL = 7
const FADE_IN_DURATION = 3

const SECONDS = 1000

interface PhotoSlideshowProps {
   folderChangeCount?: any
 }
 
 export const PhotoSlideshow: React.FC<PhotoSlideshowProps> = (
   {
      folderChangeCount
   }
 ) => 
{
   console.log(folderChangeCount)
   // Does folder path need to be added to this state ? ? ?
   const [state, dispatch] = useReducer(reducer, initialState)

   const nodeRef = useRef(null)

   useEffect(() =>
   {
      async function load()
      {
         try
         {
            const photos = await GET_PHOTOS()

            if(photos.length === 0)
               throw new Error("No photos found that meet criteria.")

            console.log(`${photos.length} photos found that meet criteria`)

            shuffle(photos)
            dispatch({ type: "load", photos })
         }
         catch(err: any)
         {
            window.alert(err.toString())
            closeWindow()
         }
      }

      // dispatch({ type: "changeFolderPath" })
      load()
   },
   // Somehow get folder path into this useEffect dependency array...
   // [state.photos /*folderChangeCount*/])
   )

   useEffect(() =>
   {
      if(state.photos.length > 0)
      {
         const interval = window.setInterval(() => dispatch({ type: "next" }), PHOTO_INTERVAL * SECONDS)
         return () => window.clearInterval(interval)
      }
   },
   [state.photos])

   useEffect(() =>
   {
      if(state.photoIdx >= 0)
         console.log(`photo ${state.photoIdx}: ${state.photos[state.photoIdx].url}`)
   },
   [state.photos, state.photoIdx])

   async function onImageLoad()
   {
      // If we dispatch the imageload action too quickly, the visible style will be added to the
      // photo div too quickly and the browser won't run its animations. This delay is enough to
      // solve the problem.
      await delay(100)

      dispatch({ type: "imageload" })
   }

   return (
      <div className={styles.root}>
         {state.photoIdx >= 0 &&
            <TransitionGroup>
               <Transition key={state.photoIdx} nodeRef={nodeRef} timeout={(FADE_IN_DURATION + 1) * SECONDS} appear={true}>
                  <div ref={nodeRef}>
                     <div
                        className={classNames(styles.photo, { [styles.visible]: state.isImageLoaded })}
                        style={{ zIndex: state.zIndex, transformOrigin: `${state.origin.x}% ${state.origin.y}%` }}
                     >
                        <img
                           src={state.photos[state.photoIdx].url}
                           alt=""
                           onLoad={onImageLoad}
                           onError={e => dispatch({ type: "next" })}
                        />
                     </div>
                     <label
                        className={classNames(styles[`pos${state.photoIdx % 4}`], { [styles.visible]: state.isImageLoaded })}
                        style={{ zIndex: state.zIndex }}
                     >
                        {getCaption(state.photos[state.photoIdx])}
                     </label>
                  </div>
               </Transition>
            </TransitionGroup>
         }
      </div>
   )
}

interface State
{
   photos: Photo[],
   photoIdx: number,
   zIndex: number,
   origin: { x: number, y: number },
   isImageLoaded: boolean,
   currentFolderPath: string,
}

const initialState: State =
{
   photos: [],
   photoIdx: -1,
   zIndex: 0,
   origin: { x: 0, y: 0 },
   isImageLoaded: false,
   currentFolderPath: ""
}

interface ActionLoad
{
   type: "load",
   photos: Photo[],
}

interface ActionNext
{
   type: "next"
}

interface ActionImageLoad
{
   type: "imageload"
}

interface ActionChangeFolderPath
{
   type: "changeFolderPath"
}

type Action = ActionLoad | ActionNext | ActionImageLoad | ActionChangeFolderPath

function reducer(
   state: State,
   action: Action)
: State
{
   switch(action.type)
   {
      case "load":
         return {
            photos: action.photos,
            photoIdx: 0,
            zIndex: 1,
            origin: getRandomOrigin(),
            isImageLoaded: false,
            currentFolderPath: "",
         }

      case "next":
         return {
            ...state,
            photoIdx: (state.photoIdx >= state.photos.length - 1) ? 0 : state.photoIdx + 1,
            zIndex: state.zIndex + 1,
            origin: getRandomOrigin(),
            isImageLoaded: false,
         }

      case "imageload":
         return { ...state, isImageLoaded: true }

      case "changeFolderPath":
         return {...state, photos: [], photoIdx: -1}
   }
}

function getRandomOrigin()
{
   return { x: getRandom(0, 100), y: getRandom(0, 100) }
}

function getCaption(
   photo: Photo)
{
   if(photo.title || photo.attribution)
      return `${photo.title || "(Untitled)"} ${photo.attribution}`

   return ""
}

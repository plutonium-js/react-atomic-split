# Plutonium [react atomic split component]
### About
An advanced React component that adds staggered animation capabilities to child elements and components.  Optionally split child text into animatable component characters and words!
   * Stagger animate child components, elements, and text
   * Use pure CSS key frame animations or transitions
   * Control with commands like 'running', 'paused', 'to', 'from', 'reset', and more
   * Split and animate text characters, words, and spaces
   * Create amazing text effects with ease
   * Perfect for animating and highlighting lists of all types


### Links

* [Atomic Split Home](https://plutonium.dev/wp/libraries/react-atomic-split)
   * [Documentation](https://plutonium.dev/wp/libraries/react-atomic-split/documentation)
   * [API](https://plutonium.dev/wp/libraries/react-atomic-split/api)
* [Atomic Home](https://plutonium.dev/wp/libraries/react-atomic)

### Bookmarks
* [Installation](#Installation)
* [Usage](#Usage)
   * [Module](#Module)
   * [CDN Script Tags](#CDN-Script-Tags)
* [Create Component](#create_component)
* [Animate](#animate)


### <a id="Installation"></a>Installation
```
> npm install @plutonium-js/react-atomic-split
```

**[:arrow_up_small:](#bookmarks)**	

### <a id="Usage" style="color:yellow;"></a>Usage

* <a id="Module"></a>**Module**
   
   Using ES6...
   ```javascript
   import AtomicSplit from '@plutonium-js/react-atomic-split';
   ```
   Or when using CommonJS...
   ```javascript
   const {AtomicSplit} = require('@plutonium-js/react-atomic-split');
   ```
   
* <a id="CDN-Script-Tags"></a>**CDN Script Tag**
   
    Add the component directly to a web page.
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@plutonium-js/react-atomic-split@1/dist/bundle.min.js"></script>
   ```

**[:arrow_up_small:](#bookmarks)**	
   
### <a id="create_component"></a>Create Component
To create a basic Atomic Split component, add the 'AtomicSplit' tag to your JSX. The child content can be any text, elements, or other React components.
```jsx
   render() {
      return (
         <AtomicSplit>your content here</AtomicSplit>;
      );
   }
```

**[:arrow_up_small:](#bookmarks)**	

### <a id="animate"></a>Animate
To animate an Atomic Split component add the animate property. The example below splits the text and stagger animates each character into place with a fade in / slide motion.
```jsx
render() {
   return <AtomicSplit
      animate = {{
         chrs:{
            transitions:{
               opacity:{from:0, to:1},
               transform:{from:'translateX(30vw)', to:'translateX(0vw)'}
            },
            animation:"2s ease",
            playState:'running',
            stagger:{
               duration:1000,
               easeType:'ease'
            }
         }
      }}
   >Plutonium Split Text!</AtomicSplit>;
}
```
The example above animates the characters group ('chrs'). A single group or combinations of multiple groups can be animated. Allowable groups include...
   * <strong>root</strong> - The root compnoent element.
   * <strong>all</strong> - All child nodes, characters, words, and spaces.
   * <strong>nodes</strong> - All child elements and components.
   * <strong>chrs</strong> - All child characters.
   * <strong>words</strong> - All child words.
   * <strong>spaces</strong> - All child spaces.

For additional information on how to define <strong>key frames</strong> and <strong>transitions</strong> refer to the base React Atomic documenation…

[React Atomic - Key Frames or Transitions](https://plutonium.dev/wp/libraries/react-atomic/documentation/#key_frames_or_transitions)

**[:arrow_up_small:](#bookmarks)**	

### <a id="License"></a>License

Released under the [MIT license](LICENSE.md)

Author: Jesse Dalessio / [Plutonium.dev](https://plutonium.dev)

**[:arrow_up_small:](#bookmarks)**
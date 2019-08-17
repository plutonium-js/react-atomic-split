//Plutonium - [react-atomic-split] - An ultra lightweight Atomic React component that splits, animates, and staggers child nodes and text into word, character, and space components.
/*
 * Plutonium [React-Split-Text]
 * (c) 2019 Jesse Dalessio - https://plutonium.dev
 * Released under the MIT license
*/
import React from 'react';
import Atomic from '@plutonium-js/react-atomic';

export class AtomicSplit extends Atomic {
	constructor (props) {
		super(props);
		this.name = 'AtomicSplit';
		this.split = {
			children:null,
			groups:['all','words','chrs','spaces','nodes']
		};
		this._addAnimations();
		this._split();
	}
	render() {
		let elm = this._LIB.getRoot(this, {
			children:this.split.children,
			className:'PU-'+this.uid+'-all PU-'+this.uid+'-root'
		});
		return super.render(elm);
	}
	getSnapshotBeforeUpdate(prevProps, prevState) {
		super.getSnapshotBeforeUpdate(prevProps, prevState);
		let details; if (!(details=this._LIB.util.compare([this.props.animate,prevProps.animate],{deep:true,details:true})).result) {
			this._addAnimations();
			let groupsNames={}; details.keyPaths.forEach(keyPath => groupsNames[keyPath.split(".")[0]]=1);
			for (let i in groupsNames) {
				let resetToPlayState = this.split[i].playState;
				if (this.split.groups.includes(i)) this.setPlayState('reset', {
					group:i,
					resetToPlayState:/none|cancel/.test(resetToPlayState)?'running':resetToPlayState
				});
			}
		}
		let compareKeys = [this.props.children, prevProps.children].map(children => React.Children.toArray(children).map(child => (typeof child==="string")?child:child.key));
		if (!this._LIB.util.compare(compareKeys)) this.update();
		return null;
	}
	componentDidMount() {
		super.componentDidMount();
		this._runAnimations();
	}
	
	//set the play state (types:'toggle','to','from','pause','running','cancel','reset' --- params.groups:'all','words','chrs','spaces','nodes')
	//note: to keep the logic simple, 'to' and 'from' are mapped to 'running' and 'paused'
	setPlayState(type, params) {
		params = (typeof params==="string")?{group:params}:params||{};
		if (params.superOnly) {super.setPlayState(type, params); return}
		const group = params.group;
		const _T = this;
		type = {to:'running',from:'paused'}[type]||type;
		(group?[group]:this.split.groups).forEach(group => {
			const groupObj = _T.split[group];
			const setType = type==='toggle'?(groupObj.playState==='running'&&(_T.props.animate[group].transitions||groupObj.animated))?'paused':'running':type;
			_set(setType, group);
		});
		
		function _set(type, group) {
			group = group||'all';
			const groupObj = _T.split[group];
			const staggerStatus = groupObj.stagger;
			const animate = _T.props.animate[group];
			let stagger, interval, duration, itemsLen=groupObj.items.length; if (animate && groupObj.items.length) {
				if (staggerStatus.ended && type==='running') type='reset';
				if (type!=groupObj.playState) {
					_T.asyncRefs.cancel("stagger_"+group);
					staggerStatus.ended = false;
					if (/reset|cancel/.test(type)) {
						_apply(type);
						_T._resetStagger(group);
						if (type==='reset') {
							_T.asyncRefs.cancel("runAnims_"+group);
							_T.asyncRefs.add("reset_"+group, "requestAnimationFrame", requestAnimationFrame(() => {
								_T.asyncRefs.add("reset_"+group, "requestAnimationFrame", requestAnimationFrame(() => {_set( params.resetToPlayState||'running', group)}));
							}));
						}
					}
					else {
						
						stagger = animate.stagger||{};
						interval = stagger.interval||((stagger.duration||0)/(itemsLen||1));
						duration = interval*itemsLen;
						if (animate.keyframes && type==='paused') staggerStatus.pauseTime = staggerStatus.startStamp?Date.now()-staggerStatus.startStamp:0;
						if (animate.transitions||type==='running') {
							interval?_stagger():_apply(type);
							groupObj.animated = true;
						}
						else _apply(type);
					}
					groupObj.playState = type;
				}
			}
			
			//apply the provided play state to all items
			function _apply(type) {
				groupObj.items.forEach(item => item.setPlayState(type, {
					skipReset:true
				}));
			}
			
			//stagger the animation
			function _stagger(index) {
				staggerStatus.index = index = index!=null?index:staggerStatus.index;
				let staggerItem = groupObj.items[index];
				let setInterval = interval; if (stagger.easeType!='linear') {
					let pos = _T._LIB.animate.tween(index, 0, 1, groupObj.items.length-1, stagger.easeType);
					let nextPos = _T._LIB.animate.tween(index+(animate.transitions&&type==='paused'?-1:1), 0, 1, groupObj.items.length-1, stagger.easeType);
					setInterval = Math.abs(nextPos*duration-pos*duration);
				}
				let isIntervalAdjust; if (staggerStatus.startStamp) {
					const runTime = staggerStatus.runTime += staggerStatus.pauseTime||(Date.now()-staggerStatus.startStamp);
					if (runTime<staggerStatus.lastInterval) {
						setInterval =  animate.keyframes?staggerStatus.lastFullInterval-runTime:runTime;
						isIntervalAdjust = true;
					}
					else staggerStatus.runTime = 0;
					staggerStatus.pauseTime = 0;
				}
				staggerStatus.startStamp = Date.now();
				staggerStatus.lastInterval = setInterval;
				if (!isIntervalAdjust) staggerStatus.lastFullInterval = setInterval;
				const dir = animate.stagger.direction;
				let isReverse; if (animate.keyframes) {
					if (groupObj.playState==='paused') {
						for (let i=0;i<index;i++) if (groupObj.items[i].state.animState==='paused') {
							groupObj.items[i].setPlayState('running');
						}
					}
					isReverse = dir==='reverse';
				}
				else isReverse = (type==='paused'&&dir!=='reverse') || (type==='running'&&dir==='reverse');
				staggerItem.setPlayState(type);
				if ((!isReverse&&index<itemsLen-1) || (isReverse&&index>0)) {
					_T.asyncRefs.add("stagger_"+group, "setTimeout", setTimeout(() => _stagger(index+(isReverse?-1:1)), setInterval));
				}
			}
		}
	}
	
	//update the split children (typically the children will auto update when a change is detected, however this can be called directly if needed)
	update() {
		this.asyncRefs.add("update", "requestAnimationFrame", requestAnimationFrame(() => {
			this.setPlayState('cancel');
			this._split();
			this.forceUpdate(()=>{this._runAnimations()});
		}));
	}
	
	//run the animations (called on component mount and when props.children change)
	_runAnimations(){
		let animate = this.props.animate;
		for (let i in animate) {
			let playState = animate[i].playState;
			//note: the timeout is required so transitions have a request frame gap between applying to the CSS and running (requestAnimationFrame will not work) 
			if (this.split.groups.includes(i) && /running|to|from/.test(playState)) {
				this._resetStagger(i);
				const animStagger = animate[i].stagger||{};
				this.asyncRefs.add("runAnims_"+i, "setTimeout", setTimeout(() => this.setPlayState(playState, i), animStagger.delay||0));
			}
		}
	}
	
	//split the children (this splits all text node words, characters, and spaces into individual React elements)
	_split() {
		const _T = this;
		this.split.groups.forEach(name => this.split[name] = {
			items:[],
			stagger:{
				index:0,
				runTime:0
			}
		});
		const children = this.split.children = React.Children.toArray(this.props.children);
		//remove React.Fragment node wrappers
		for (let i=0,child;(child=children[i])&&i<children.length;i++) {
			if (Symbol.for('react.fragment')===child.type) {
				children.splice(i, 1); i--;
				let fragChildren = child.props.children;
				fragChildren = (typeof fragChildren==="string")?[fragChildren]:fragChildren;
				fragChildren.forEach(child => {
					children.splice(i+1, 0, child); i++;
				});
			}
		};
		//split the children
		for (let i=0,child;(child=children[i])&&i<children.length;i++) {
			if (child.key) child.key = _T._LIB.util.getUid();
			children.splice(i, 1); i--;
			if (typeof child==="string") {
				const words = child.split(/ +/);
				for (let j=0, chrs;(chrs=words[j])&&j<words.length;j++) {
					chrs = chrs.split('').map(chr => _create_element("chr", chr))
					let word = _create_element("word", chrs, {whiteSpace:'nowrap'});
					children.splice(i+1, 0, word); i++;
					if (j<words.length-1) {children.splice(i+1, 0, _create_element("space", <>&nbsp;</>, {lineHeight:'0px'})); i++}
				}
			}
			else {
				children.splice(i+1, 0, _create_element('node',child)); i++;
			}
		}
			
		//create an atomic split item element (type can be 'node', 'word', 'chr', 'space')
		function _create_element(type, children, styles) {
			return <AtomicSplitItem
				type = {type}
				_owner = {_T}
				className = {'PU-'+_T.uid+'-all PU-'+_T.uid+'-'+type+'s'}
				style = {Object.assign({display:'inline-block'},styles)}
				
				ref = {component => {
					if (component) {
						_T.split.all.items.push(component);
						_T.split[type+'s'].items.push(component);
					}
				}}
			>{children}</AtomicSplitItem>;
		}
	}
	
	//add animations
	_addAnimations() {
		const animate = this.props.animate; if (animate) {
			for (let i in animate) if (this.split.groups.includes(i)) this._LIB.animate.add(this, i, animate[i]);
		}
	}
	
	//reset a groups play state
	_resetStagger(group) {
		const groupObj = this.split[group];
		const stagger = groupObj.stagger;
		const animStagger = this.props.animate[group].stagger||{};
		stagger.pauseTime = 0;
		stagger.runTime = 0;
		stagger.startStamp = 0;
		stagger.index = (animStagger.direction==='reverse')?groupObj.items.length-1:0;
	}
}

//Atomic Split Item Component (words, characters, spaces, nodes)
class AtomicSplitItem extends Atomic{
	constructor (props) {
		super(props);
		this.name = 'AtomicSplitItem';
		this._OWNER = props._owner;
		this.endedCount = 0;
		this.isMounted = false;
		this.autoReset = false;
	}
	render() {
		let elm;
		if (this.props.type==='node') {
			const child = this.props.children;
			elm = React.cloneElement(child,{
				...child.props,
				className:((child.props.className||'')+" "+this._LIB.getRootClassNames(this)).trim(),
			},
			child.props.children);
		}
		else elm = this._LIB.getRoot(this, null, ['animate', '_owner', 'type']);
		super.render(elm);
		return elm;
	}
	getSnapshotBeforeUpdate(prevProps, prevState) {
		return null;
	}
	componentDidUpdate(){}
	componentDidMount(){}
	
	//handle animation and transition end
	handleAnimationEnd(e) {
		super.handleAnimationEnd(e);
		['all', this.props.type+'s'].forEach(group => {
			const animateGroup = this._OWNER.props.animate[group];
			if (animateGroup) {
				const groupObj =  this._OWNER.split[group];
				const items = groupObj.items;
				const len = items.length;
				const isFrom = animateGroup.transitions && groupObj.playState==='paused';
				const animation = this._LIB.animate.animations[this.props.type+'s'];
				this.endedCount++; if (this.endedCount==animation.qty) {
					if ((!isFrom && this===items[len-1] || (group==='all' && this===items[len-2])) || (isFrom && this===items[0])) {
						groupObj.animated = false;
						groupObj.stagger.ended = true;
						if ((this._OWNER.props.animate[group]||{}).keyframes) this._OWNER._resetStagger(group);
						const onEnd = this._OWNER.props["onAnimate"+(this._LIB.util.capitalize(group))+"End"]; if (onEnd) onEnd({
							component:this._OWNER,
							nativeEvent:e
						});
					}
					this.endedCount=0;
				}
			}
		});
	}
}
export default AtomicSplit;























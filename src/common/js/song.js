import { getLyric } from 'api/song';
import { ERR_OK } from 'api/config';
//解码base64
import { Base64 } from 'js-base64';


export default class Song {
	constructor({ id, mid, singer, name, album, duration, image, url }) {
		this.id = id;
		this.mid = mid;
		this.singer = singer;
		this.name = name;
		this.album = album;
		this.duration = duration;
		this.image = image;
		this.url = url;
	}

	getLyric() {

		//判断
		if (this.lyric) {
			return Promise.resolve(this.lyric);
		}

		return new Promise((resolve, reject) => {
			getLyric(this.mid).then((res) => {
				if (res.retcode === ERR_OK) {
					this.lyric = Base64.decode(res.lyric);
					resolve(this.lyric);

					// console.log('---抓歌词');
					// console.log(this.lyric);
				}
				else {
					reject('no lyric');
				}
			})

		})


	}
}

export function createSong(musicData) {
	let one = {
		id: 4962990,
		mid: '002ZKnKQ34rbZu',
		url: 'http://dl.stream.qqmusic.qq.com/C400002ZKnKQ34rbZu.m4a?guid=6493540068&vkey=94CD24A4FEDA8EA87F967173E823C435D7014F3AADEAE225FFE9F496D3CD28AAE60D642427C0F511880385C330869A84F59481EE61FDDD5B&uin=0&fromtag=38',
		duration: 302.370249
	};

	let two = {
		id: 8292,
		mid: '002ihFxm1EarI4',
		url: 'http://dl.stream.qqmusic.qq.com/C400002ihFxm1EarI4.m4a?guid=6493540068&vkey=AF76756C914582036D6A9018D6FA8E32EA92946B40C852BEBD83FA0D717BD5AF3B741AB12011039973F1E368816A33D787CF76698EA60642&uin=0&fromtag=38',
		duration: 171.270385
	}

	let num = Math.random();

	return new Song({
		// id: musicData.songid,
		// mid: musicData.songmid,
		id: num >= 0.5? one.id : two.id,
		mid: num >= 0.5? one.mid : two.mid,
		singer: filterSinger(musicData.singer),
		name: musicData.songname,
		album: musicData.albumname,
		// duration: musicData.interval,
		duration: num >= 0.5? one.duration : two.duration,
		image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
		url: num >= 0.5? one.url : two.url
	})
}

function filterSinger(singer) {
	let ret = [];
	if(!singer) {
		return ''
	}

	singer.forEach((s) => {
		ret.push(s.name);
	})

	return ret.join('/')
}
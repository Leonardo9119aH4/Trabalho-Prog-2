(() => {
	const onIntersect = (entries, obs) => {
		entries.forEach(e => {
			if (e.isIntersecting) {
				e.target.classList.add('reveal');
				obs.unobserve(e.target);
			}
		});
	};
	const io = ('IntersectionObserver' in window) ? new IntersectionObserver(onIntersect, { rootMargin: '0px 0px -10% 0px' }) : null;
	document.querySelectorAll('.feature-card').forEach(el => {
		if (io) io.observe(el); else el.classList.add('reveal');
	});

	(async function toggleFooterAuth(){
		try{
			const res = await fetch('/user');
			if(res.ok){
				const footer = document.getElementById('footer-auth-actions');
				if(footer) footer.hidden = true;
			}
		}catch{}
	})();
})();

module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        return next();
      } 
      req.flash('error_msg', 'Please log in to view that resource');
      res.redirect('/login');
    }
  };
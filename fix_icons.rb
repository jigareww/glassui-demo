require 'xcodeproj'
project_path = 'ios/ReactNativeStarter.xcodeproj'
project = Xcodeproj::Project.open(project_path)
target = project.targets.first
group_path = 'ReactNativeStarter'
group = project.main_group.find_subpath(group_path, false)
resources_build_phase = target.resources_build_phase

icons = [
  'diwali-gold', 'christmas-gold', 'holi', 'holi-gold', 
  'halloween', 'halloween-gold', 'newyear', 'newyear-gold'
]

icons.each do |icon|
  ['@2x', '@3x'].each do |scale|
    file_name = "#{icon}#{scale}.png"
    
    # Find existing and fix path
    file_ref = group.files.find { |f| f.path.include?(file_name) }
    if file_ref
      file_ref.set_path("ReactNativeStarter/Icons/#{file_name}")
      file_ref.source_tree = 'SOURCE_ROOT'
      puts "Fixed path for #{file_name}"
    end
  end
end

project.save
puts "Successfully fixed project.pbxproj paths"
